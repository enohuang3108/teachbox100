"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { Button } from "@/components/atoms/shadcn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/shadcn/popover";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { StageFixed } from "@/components/templates/StageFixed";
import { ExamMode } from "@/components/timer/ExamMode";
import { TimerDial } from "@/components/timer/TimerDial";
import { useTimer } from "@/components/timer/useTimer";
import { formatTime, PRESETS } from "@/lib/timer/timer";
import { Check } from "lucide-react";
import { useState } from "react";

const pageInfo: PageWithKey = { ...pages.timer, key: "timer" };

export default function TimerPage() {
  const [sound, setSound] = useState(true);
  const [exam, setExam] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const timer = useTimer(sound);

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      {/* 一顆膠囊裡兩格，看起來是切換而不是兩顆獨立按鈕 */}
      <div className="bg-ink/5 border-ink/10 mr-1 flex rounded-full border p-0.5">
        {[
          { label: "計時器", on: false },
          { label: "考試時間", on: true },
        ].map(({ label, on }) => (
          <button
            key={label}
            type="button"
            aria-pressed={exam === on}
            onClick={() => setExam(on)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors duration-150 ${
              exam === on
                ? "bg-paper text-ink shadow-sm"
                : "text-ink-soft/70 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {!exam && (
        <Tip label="重設">
          <RefreshCWIcon
            className={ACTION_BTN}
            size={20}
            aria-label="重設"
            onClick={timer.reset}
          />
        </Tip>
      )}
      <SoundToggleButton on={sound} onToggle={setSound} />
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <PageTemplate
      page={pageInfo}
      actions={actions}
      landing={{ startLabel: "開始使用" }}
    >
      <div
        className={`flex flex-col items-center gap-8 ${exam ? "" : "pr-28 sm:px-28"}`}
      >
        {exam ? (
          <ExamMode soundOn={sound} />
        ) : (
          <>
            <TimerDial
              remaining={timer.remaining}
              total={timer.total}
              done={timer.done}
            />

            {/* 操作鈕固定在螢幕右下角直排，最常按的開始鈕最大、放最下面 */}
            <StageFixed>
              <div className="fixed right-6 bottom-6 z-(--z-sticky) flex flex-col items-center gap-3">
                {/* 預設時間收進選單：圓鈕顯示目前設定的長度，點開往左彈出清單 */}
                <Popover open={presetsOpen} onOpenChange={setPresetsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      aria-label="預設時間"
                      className="size-16 flex-col gap-0 rounded-full p-0 transition-transform duration-press ease-out active:scale-[0.97]"
                    >
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        時間
                      </span>
                      <span className="text-sm font-bold tabular-nums">
                        {formatTime(timer.total)}
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
                      aria-label="預設時間"
                      className="flex flex-col"
                    >
                      {PRESETS.map((sec) => {
                        const active = timer.total === sec && !timer.running;
                        return (
                          <li key={sec}>
                            <button
                              type="button"
                              role="menuitemradio"
                              aria-checked={active}
                              onClick={() => {
                                timer.setSeconds(sec);
                                setPresetsOpen(false);
                              }}
                              className={`flex w-28 items-center justify-between rounded-xl px-3 py-2 text-base font-semibold tabular-nums transition-colors duration-hover ${
                                active
                                  ? "bg-secondary text-ink"
                                  : "text-ink-soft hover:bg-muted hover:text-ink"
                              }`}
                            >
                              {formatTime(sec)}
                              {active && (
                                <Check className="size-4" aria-hidden />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  onClick={() => timer.bump(60)}
                  className="size-16 rounded-full p-0 text-sm font-bold transition-transform duration-press ease-out active:scale-[0.97]"
                >
                  +1 分
                </Button>
                <Button
                  variant="outline"
                  onClick={timer.reset}
                  className="size-16 rounded-full p-0 text-sm font-bold transition-transform duration-press ease-out active:scale-[0.97]"
                >
                  重設
                </Button>
                <Button
                  // 響完鈴時 remaining 已經是 0，按下去要先回到設定的長度，不然沒得開始
                  onClick={
                    timer.running
                      ? timer.pause
                      : timer.done
                        ? timer.reset
                        : timer.start
                  }
                  disabled={!timer.done && timer.remaining <= 0}
                  // 計時中變紅：按下去是「停」，顏色跟開始區分開
                  className={`mt-2 size-24 rounded-full p-0 text-xl font-bold transition-[transform,background-color] duration-press ease-out active:scale-[0.97] ${
                    timer.running
                      ? "bg-danger text-paper hover:bg-danger/90"
                      : ""
                  }`}
                >
                  {timer.running ? "暫停" : timer.done ? "再一次" : "開始"}
                </Button>
              </div>
            </StageFixed>
          </>
        )}
      </div>
    </PageTemplate>
  );
}
