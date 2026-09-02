"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";

// 首頁 footer 三顆說明標籤共用的外觀，page.tsx 也 import 這一份避免兩邊走鐘
export const FACT_BADGE =
  "rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink-soft";

// 老師多半沒聽過 PWA，整份文案只講「裝到裝置上」「加到主畫面」
const STEPS = [
  {
    device: "iPhone、iPad",
    hint: "",
    actions: [
      "點瀏覽器的分享按鈕",
      "選「加入主畫面」",
      "按右上角「新增」",
    ],
  },
  {
    device: "Android 手機、平板",
    hint: "",
    actions: ["點右上角的「⋮」", "選「安裝應用程式」或「加到主畫面」", "按「安裝」"],
  },
  {
    device: "電腦",
    hint: "請用 Chrome 或 Edge 開啟",
    actions: ["看網址列最右邊，會有一個小小的安裝圖示", "點它，再按「安裝」"],
  },
];

export const OfflineGuideDialog = () => (
  <Dialog>
    <DialogTrigger className={`${FACT_BADGE} cursor-pointer underline decoration-2 underline-offset-4 transition-transform duration-150 ease-out active:scale-[0.97]`}>
      可離線使用
    </DialogTrigger>
    <DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto bg-paper-warm">
      <DialogTitle className="text-xl font-bold text-ink">
        把 TeachBox100 裝到裝置上
      </DialogTitle>
      <DialogDescription className="text-base leading-[1.75] text-muted-foreground">
        裝好之後，桌面上會多一個 TeachBox100 的圖示，點開就像一般的 App。
        教室網路不穩或斷線，也能照常上課。不用帳號、不用去 App Store 下載、不用付錢。
      </DialogDescription>

      <div className="mt-2 space-y-5">
        {STEPS.map(({ device, hint, actions }) => (
          <section key={device}>
            <h3 className="text-base font-bold text-ink">
              {device}
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                {hint}
              </span>
            </h3>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-base leading-[1.7] text-ink-soft">
              {actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p className="mt-2 rounded-2xl bg-sand px-4 py-3 text-sm leading-[1.7] text-ink-soft">
        <strong className="font-bold text-ink">裝好之後：</strong>
        從主畫面（或桌面）的圖示打開一次，它會自動把全部教材存進裝置，
        大約一分鐘。請在有 Wi-Fi 的地方等它跑完，之後就完全不需要網路了。
      </p>
    </DialogContent>
  </Dialog>
);
