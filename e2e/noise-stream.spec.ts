import { expect, test } from "@playwright/test";

test("合成音訊讓噪音刻度升降，離頁時停止音軌", async ({ page }) => {
  await page.goto("/noise", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const source = new AudioContext();
    const oscillator = source.createOscillator();
    const gain = source.createGain();
    const destination = source.createMediaStreamDestination();
    gain.gain.value = 0;
    oscillator.connect(gain).connect(destination);
    oscillator.start();
    const track = destination.stream.getAudioTracks()[0];
    const stop = track.stop.bind(track);
    track.stop = () => {
      stop();
      oscillator.stop();
      void source.close();
    };
    Object.assign(window, { qaNoise: { gain, track } });
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      configurable: true,
      value: async () => destination.stream,
    });
  });

  await page.getByRole("button", { name: "噓" }).click();
  const meter = page.locator('output[aria-live="polite"]');
  await expect(meter).toHaveText("很安靜");
  await page.evaluate(() => {
    const { gain } = (window as unknown as { qaNoise: { gain: GainNode } }).qaNoise;
    gain.gain.value = 1;
  });
  await expect(meter).toHaveText("太吵了", { timeout: 10_000 });
  await page.evaluate(() => {
    const { gain } = (window as unknown as { qaNoise: { gain: GainNode } }).qaNoise;
    gain.gain.value = 0;
  });
  await expect(meter).toHaveText("很安靜", { timeout: 10_000 });
  await page.getByRole("link", { name: "首頁", exact: true }).click();
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { qaNoise: { track: MediaStreamTrack } }).qaNoise.track.readyState,
  )).toBe("ended");
});

test("權限回應延遲到離頁後，取得的音軌立即停止", async ({ page }) => {
  await page.goto("/noise", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const source = new AudioContext();
    const destination = source.createMediaStreamDestination();
    const track = destination.stream.getAudioTracks()[0];
    Object.assign(window, {
      qaPermission: {
        track,
        resolve: null as null | ((stream: MediaStream) => void),
      },
    });
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      configurable: true,
      value: () => new Promise<MediaStream>((resolve) => {
        (window as unknown as { qaPermission: { resolve: typeof resolve } }).qaPermission.resolve = resolve;
      }),
    });
  });
  await page.getByRole("button", { name: "噓" }).click();
  await expect(page.getByRole("button", { name: "等待授權…" })).toBeDisabled();
  await page.getByRole("link", { name: "首頁", exact: true }).click();
  await page.evaluate(() => {
    const pending = (window as unknown as {
      qaPermission: { resolve: (stream: MediaStream) => void; track: MediaStreamTrack };
    }).qaPermission;
    pending.resolve(new MediaStream([pending.track]));
  });
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { qaPermission: { track: MediaStreamTrack } }).qaPermission.track.readyState,
  )).toBe("ended");
});
