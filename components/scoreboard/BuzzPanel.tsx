"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";
import {
  renewCode,
  useBuzzStore,
  type RelayStatus,
} from "@/lib/scoreboard/buzz";
import { useEffect, useState } from "react";

/**
 * 房間到底有沒有真的開起來。trystero 的 joinRoom() 不等配對伺服器回應就回傳，
 * 所以房號和 QR 一定會出現 —— 連不上時老師只會看到「已加入 0 人」，
 * 分不出是學生還沒掃、還是自己這邊根本沒開成。這一行就是講出差別。
 *
 * 也別再叫老師「連到同一個 Wi-Fi」：學校的 Wi-Fi 常開用戶端隔離，
 * 同網段反而互通不了，那時候正確的指示是相反的（改用行動網路）。
 */
function RelayNote({ relay }: { relay: RelayStatus }) {
  if (relay === "up") return null;
  return relay === "connecting" ? (
    <p className="text-ink-soft text-center text-sm leading-[1.6]">
      正在連上配對伺服器…
    </p>
  ) : (
    <p className="bg-danger-soft text-danger-ink rounded-xl px-3 py-2 text-center text-sm leading-[1.6]">
      連不上配對伺服器，學生現在加不進來。請確認這台電腦的網路，
      或改用手機熱點再打開一次。
    </p>
  );
}

/** 已經自動彈過 QR 的房號 */
let shownFor: string | null = null;

/** 開了連線之後才出現：QR、房號、已報到的名單 */
export function BuzzPanel() {
  const code = useBuzzStore((s) => s.code);
  const enabled = useBuzzStore((s) => s.enabled);
  const players = useBuzzStore((s) => s.players);
  const relay = useBuzzStore((s) => s.relay);
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!code) return;
    let alive = true;
    // 只有「剛開好房」才自動攤開 QR。這個面板每次開設定都重新掛載，
    // 用模組層級的 shownFor 記住已經彈過哪個房號，才不會每次進設定都跳一次。
    if (shownFor !== code) {
      shownFor = code;
      setShowQr(true);
    }
    // qrcode 只有開連線才用得到，動態載入不佔首屏
    import("qrcode").then(({ toDataURL }) =>
      toDataURL(`${location.origin}/scoreboard/join#${code}`, {
        margin: 1,
        width: 640,
        color: { dark: "#2b2622", light: "#ffffff" },
      }).then((d) => alive && setQr(d)),
    );
    return () => {
      alive = false;
    };
  }, [code]);

  if (!enabled || !code) return null;
  const url = `${location.origin}/scoreboard/join#${code}`;

  return (
    <div className="flex flex-col gap-3">
      {/* QR 開在對話框裡：投影出去要讓最後一排也掃得到，塞在側邊欄太小 */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogTrigger asChild>
          <Button className="self-start">秀出 QR code</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>掃描加入搶答</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pb-2">
            <RelayNote relay={relay} />
            {/* 投影時左邊給全班掃，右邊讓老師確認誰進來了，兩件事同時看得到。
                手機或窄視窗堆疊成一欄，QR 仍然在最上面。 */}
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
              <div className="flex shrink-0 flex-col items-center gap-1 sm:flex-1">
                {/* 先佔滿位子，QR 生好再淡入，對話框不會先小後大跳一下 */}
                <div className="bg-ink/[0.04] mb-3 aspect-square w-full max-w-[min(60vh,22rem)] overflow-hidden rounded-2xl">
                  {qr && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qr}
                      alt={`加入搶答的 QR code，房號 ${code}`}
                      className="animate-in fade-in size-full duration-200 ease-out"
                    />
                  )}
                </div>
                <span className="text-ink-soft text-sm">
                  掃不到就直接開網址、輸入房號
                </span>
                <span className="text-ink text-4xl leading-none font-bold tracking-[0.25em] tabular-nums">
                  {code}
                </span>
                <span className="text-ink-soft/70 text-xs break-all">{url}</span>
              </div>

              {/* 老師開著 QR 等人進來，就是盯這個數字 */}
              <div className="border-ink/10 flex min-w-0 flex-col gap-3 border-t pt-4 sm:flex-1 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
                <span className="text-ink text-center text-xl font-semibold tabular-nums sm:text-left">
                  已加入 {players.length} 人
                </span>
                {players.length === 0 ? (
                  <p className="text-ink-soft text-center text-sm leading-[1.75] sm:text-left">
                    還沒有人加入。請學生掃左邊的 QR code，填名字後按加入。
                  </p>
                ) : (
                  /* 40 人的名單在對話框裡放不下，超過就讓它自己捲 */
                  <ul className="grid max-h-[min(50vh,22rem)] grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto">
                    {players.map((p, i) => (
                      <li
                        key={p.uid}
                        className="text-ink flex min-w-0 items-baseline gap-2 text-base leading-[1.75]"
                      >
                        <span className="text-ink-soft/70 shrink-0 text-xs tabular-nums">
                          {i + 1}
                        </span>
                        <span className="truncate">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RelayNote relay={relay} />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-ink text-lg font-bold tracking-[0.2em] tabular-nums">
          {code}
        </span>
        {/* 換班上課才需要：舊房號作廢，已連著的學生要重掃 */}
        <button
          type="button"
          onClick={renewCode}
          className="text-ink-soft hover:text-ink text-sm underline underline-offset-4 transition-colors duration-150 ease-out"
        >
          重新建立房間
        </button>
      </div>

      <div className="text-ink-soft text-sm leading-[1.75]">
        已加入 {players.length} 人
        {players.length > 0 && (
          <span className="text-ink">
            ：{players.map((p) => p.name).join("、")}
          </span>
        )}
      </div>
    </div>
  );
}
