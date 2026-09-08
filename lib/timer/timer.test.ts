import { describe, expect, it } from "vitest";
import { addSeconds, formatTime, MAX_SECONDS, progress } from "./timer";

describe("formatTime", () => {
  it("補零到 MM:SS", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(61)).toBe("01:01");
    expect(formatTime(600)).toBe("10:00");
  });

  it("負數當成 0，超過上限夾住", () => {
    expect(formatTime(-3)).toBe("00:00");
    expect(formatTime(MAX_SECONDS + 100)).toBe("99:59");
  });

  it("不足一秒仍顯示 00:01，歸零前不會提早跳 00:00", () => {
    expect(formatTime(0.4)).toBe("00:01");
  });
});

describe("progress", () => {
  it("回傳 0..1", () => {
    expect(progress(300, 600)).toBe(0.5);
    expect(progress(-5, 600)).toBe(0);
    expect(progress(700, 600)).toBe(1);
  });

  it("總長 0 不會除以零", () => {
    expect(progress(10, 0)).toBe(0);
  });
});

describe("addSeconds", () => {
  it("夾在 0 與上限之間", () => {
    expect(addSeconds(60, 60)).toBe(120);
    expect(addSeconds(10, -60)).toBe(0);
    expect(addSeconds(MAX_SECONDS, 60)).toBe(MAX_SECONDS);
  });
});
