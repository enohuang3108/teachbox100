"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { Button } from "@/components/atoms/shadcn/button";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { NoiseMeter } from "@/components/noise/NoiseMeter";
import { ThresholdSlider } from "@/components/noise/ThresholdSlider";
import { StageFixed } from "@/components/templates/StageFixed";
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
    <PageTemplate
      page={pageInfo}
      actions={actions}
      // 介紹頁的按鈕直接開麥克風，不必進來再按一次
      landing={{ startLabel: "噓", onStart: meter.start }}
    >
      <div className="flex flex-col items-center gap-8">
        {meter.state === "on" ? (
          <>
            {/* 右邊固定著門檻刻度尺，左右各留一段空間，柱子才不會被蓋到；往上提一點，不要沉在畫面中下方 */}
            <div className="-mt-16 w-full px-16 sm:-mt-24 sm:px-20">
              <NoiseMeter level={meter.level} limit={limit} />
            </div>
            <StageFixed>
              <ThresholdSlider value={limit} onChange={setLimit} />
            </StageFixed>
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
