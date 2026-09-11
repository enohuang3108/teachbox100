"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";
import { renewCode, useBuzzStore } from "@/lib/scoreboard/buzz";
import { useEffect, useState } from "react";

/** 已經自動彈過 QR 的房號 */
let shownFor: string | null = null;

/** 開了連線之後才出現：QR、房號、已報到的名單 */
export function BuzzPanel() {
  const code = useBuzzStore((s) => s.code);
  const players = useBuzzStore((s) => s.players);
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

  if (!code) return null;
  const url = `${location.origin}/scoreboard/join#${code}`;

  return (
    <div className="flex flex-col gap-3">
      {/* QR 開在對話框裡：投影出去要讓最後一排也掃得到，塞在側邊欄太小 */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogTrigger asChild>
          <Button className="self-start">秀出 QR code</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>掃描加入搶答</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 pb-2">
            {/* 先佔滿位子，QR 生好再淡入，對話框不會先小後大跳一下 */}
            <div className="bg-ink/[0.04] aspect-square w-full max-w-[min(70vh,28rem)] overflow-hidden rounded-2xl">
              {qr && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qr}
                  alt={`加入搶答的 QR code，房號 ${code}`}
                  className="animate-in fade-in size-full duration-200 ease-out"
                />
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-ink-soft text-sm">
                掃不到就直接開網址、輸入房號
              </span>
              <span className="text-ink text-4xl leading-none font-bold tracking-[0.25em] tabular-nums">
                {code}
              </span>
              <span className="text-ink-soft/70 text-xs break-all">{url}</span>
            </div>
            <p className="text-ink-soft text-center text-sm leading-[1.6]">
              請確認老師與學生的裝置連到同一個 Wi-Fi，再掃 QR code 加入。
            </p>
            {/* 老師開著 QR 等人進來，就是盯這個數字；名單放小字在下面 */}
            <div className="border-ink/10 flex w-full flex-col items-center gap-1 border-t pt-4">
              <span className="text-ink text-xl font-semibold tabular-nums">
                已加入 {players.length} 人
              </span>
              {players.length > 0 && (
                <span className="text-ink-soft text-center text-sm leading-[1.75]">
                  {players.map((p) => p.name).join("、")}
                </span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
