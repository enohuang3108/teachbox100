"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { Button } from "@/components/atoms/shadcn/button";
import { Slider } from "@/components/atoms/shadcn/slider";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { NoiseMeter } from "@/components/noise/NoiseMeter";
import { useNoiseMeter } from "@/components/noise/useNoiseMeter";
import { useNoiseStore } from "@/lib/noise/store";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";

const pageInfo: PageWithKey = { ...pages.noise, key: "noise" };

const HINT: Record<string, string> = {
  denied:
    "瀏覽器擋住了麥克風。點網址列左邊的鎖頭，把麥克風改成「允許」再試一次。",
  unsupported: "這個瀏覽器不支援麥克風，換 Chrome、Edge 或 Safari 開開看。",
};

export default function NoisePage() {
  // 門檻讀 persist；滑桿只在麥克風開著時才渲染（使用者點過才會到），
  // 那時已經在 client，不會有 SSR 對不上的問題，所以不必擋 hydration。
  const { limit, setLimit } = useNoiseStore();
  const meter = useNoiseMeter();

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <PageTemplate page={pageInfo} actions={actions}>
      <div className="flex flex-col items-center gap-8">
        {meter.state === "on" ? (
          <>
            <NoiseMeter level={meter.level} limit={limit} />

            <div className="bg-paper-warm border-ink/10 flex w-full max-w-md flex-col gap-3 rounded-2xl border p-4">
              <span className="text-ink flex items-center justify-between font-semibold">
                太吵的門檻
                <span className="text-muted-foreground tabular-nums">
                  {limit}
                </span>
              </span>
              <Slider
                value={[limit]}
                min={20}
                max={95}
                step={1}
                onValueChange={([v]) => setLimit(v)}
                aria-label="太吵的門檻"
              />
              <span className="text-muted-foreground text-sm">
                班上比較活潑就往右調，需要安靜寫作業就往左調。
              </span>
            </div>

            <Button variant="outline" onClick={meter.stop}>
              關掉麥克風
            </Button>
          </>
        ) : (
          <div className="flex max-w-md flex-col items-center gap-5 text-center">
            <p className="text-muted-foreground text-base leading-[1.9]">
              打開麥克風就能看到教室現在有多吵。
              <strong className="text-ink font-semibold">
                聲音只在這台裝置上計算
              </strong>
              ，不會被錄下來，也不會送到任何伺服器。
            </p>
            <Button
              size="lg"
              onClick={meter.start}
              disabled={meter.state === "starting"}
            >
              {meter.state === "starting" ? "等待授權…" : "打開麥克風"}
            </Button>
            {HINT[meter.state] && (
              <p className="text-brand-red text-sm font-medium">
                {HINT[meter.state]}
              </p>
            )}
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
