"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { Button } from "@/components/atoms/shadcn/button";
import { Dialog, DialogContent } from "@/components/atoms/shadcn/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/shadcn/popover";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { Scoreboard } from "@/components/scoreboard/Scoreboard";
import { SetupPanel } from "@/components/scoreboard/SetupPanel";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { clearOrder } from "@/lib/scoreboard/buzz";
import { STEPS, useScoreboardStore } from "@/lib/scoreboard/store";
import { StageFixed } from "@/components/templates/StageFixed";
import { Check } from "lucide-react";
import { useState } from "react";

const pageInfo: PageWithKey = { ...pages.scoreboard, key: "scoreboard" };

export default function ScoreboardPage() {
  // 介紹頁 →（開始使用）設定 →（開始計分）計分板；計分板裡按設定再打開同一個對話框
  const [entered, setEntered] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const { resetScores, sound, setSound, step, setStep } = useScoreboardStore();
  const [stepOpen, setStepOpen] = useState(false);

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="重新開始">
        <RefreshCWIcon
          className={ACTION_BTN}
          size={20}
          aria-label="重新開始"
          onClick={() => {
            resetScores();
            clearOrder();
          }}
        />
      </Tip>
      <SettingsButton onClick={() => setSetupOpen(true)} />
      <SoundToggleButton on={sound} onToggle={setSound} />
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <>
      <PageTemplate
        page={pageInfo}
        actions={actions}
        landing={{
          startLabel: "開始使用",
          onStart: () => setSetupOpen(true),
          entered,
        }}
      >
        <Scoreboard />

        {/* 一次幾分貼右下角，老師站在白板前伸手就按得到 */}
        <StageFixed>
          <div className="fixed right-6 bottom-6 z-(--z-sticky) flex flex-col items-center gap-3">
            <Popover open={stepOpen} onOpenChange={setStepOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  aria-label={`一次加減 ${step} 分`}
                  className="size-16 flex-col gap-0 rounded-full p-0 transition-transform duration-press ease-out active:scale-[0.97]"
                >
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    一次
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {step} 分
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="left"
                sideOffset={12}
                className="w-auto rounded-2xl p-1.5"
              >
                <ul
                  role="menu"
                  aria-label="一次加減幾分"
                  className="flex flex-col"
                >
                  {STEPS.map((n) => (
                    <li key={n}>
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={step === n}
                        onClick={() => {
                          setStep(n);
                          setStepOpen(false);
                        }}
                        className={`flex w-28 items-center justify-between rounded-xl px-3 py-2 text-base font-semibold tabular-nums transition-colors duration-hover ${
                          step === n
                            ? "bg-secondary text-ink"
                            : "text-ink-soft hover:bg-muted hover:text-ink"
                        }`}
                      >
                        {n} 分
                        {step === n && <Check className="size-4" aria-hidden />}
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        </StageFixed>
      </PageTemplate>

      {/* 放在 PageTemplate 外面：介紹頁階段 children 不渲染，設定要在那時就能開 */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <SetupPanel
            onStart={() => {
              setSetupOpen(false);
              setEntered(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
