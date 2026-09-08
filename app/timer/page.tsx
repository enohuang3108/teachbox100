"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { Button } from "@/components/atoms/shadcn/button";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { ExamMode } from "@/components/timer/ExamMode";
import { TimerDial } from "@/components/timer/TimerDial";
import { useTimer } from "@/components/timer/useTimer";
import { formatTime, PRESETS } from "@/lib/timer/timer";
import { useState } from "react";

const pageInfo: PageWithKey = { ...pages.timer, key: "timer" };

export default function TimerPage() {
  const [sound, setSound] = useState(true);
  const [exam, setExam] = useState(false);
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
    <PageTemplate page={pageInfo} actions={actions}>
      <div className="flex flex-col items-center gap-8">
        {exam ? (
          <ExamMode soundOn={sound} />
        ) : (
          <>
            <TimerDial
              remaining={timer.remaining}
              total={timer.total}
              done={timer.done}
            />

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                size="lg"
                className="min-w-32"
                // 響完鈴時 remaining 已經是 0，按下去要先回到設定的長度，不然沒得開始
                onClick={
                  timer.running
                    ? timer.pause
                    : timer.done
                      ? timer.reset
                      : timer.start
                }
                disabled={!timer.done && timer.remaining <= 0}
              >
                {timer.running ? "暫停" : timer.done ? "再一次" : "開始"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => timer.bump(60)}
              >
                +1 分
              </Button>
              <Button variant="outline" size="lg" onClick={timer.reset}>
                重設
              </Button>
            </div>

            <fieldset className="flex flex-wrap items-center justify-center gap-2">
              <legend className="sr-only">快速設定時間</legend>
              {PRESETS.map((s) => {
                const active = timer.total === s && !timer.running;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => timer.setSeconds(s)}
                    className={`rounded-full border px-4 py-2 text-base font-semibold tabular-nums transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
                      active
                        ? "bg-ink border-ink text-paper"
                        : "bg-paper-warm border-ink/10 text-ink-soft hover:text-ink"
                    }`}
                  >
                    {formatTime(s)}
                  </button>
                );
              })}
            </fieldset>
          </>
        )}
      </div>
    </PageTemplate>
  );
}
