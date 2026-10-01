"use client";

import { TimerDial } from "@/components/timer/TimerDial";
import { useSound } from "@/lib/hooks/useSound";
import {
  examState,
  hasStarted,
  isOver,
  startBanner,
  type ExamSlot,
} from "@/lib/timer/exam";
import { useEffect, useRef, useState } from "react";

/**
 * 考試模式：整個畫面只看牆上時鐘，沒有開始、暫停、選科目 ——
 * 到了開始時間自動倒數並播開考音效，結束就響鈴換下一節，午休也照表倒數。
 */
export function ExamMode({
  date,
  slots,
  warnMin,
  soundOn,
}: {
  date: string;
  slots: ExamSlot[];
  warnMin: number;
  soundOn: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  const { playBonusSound, playGoSound } = useSound();

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);

  const clock = new Date(now);
  const state = examState(slots, clock, date);
  const { index, remaining, total, running } = state;
  const slot = slots[index];
  const allOver = !!slot && !running && remaining <= 0;
  const examsOver = slots.filter(
    (s) => !s.rest && isOver(s, clock, date),
  ).length;

  const exams = slots.filter((s) => !s.rest);
  const started = exams.filter((s) => hasStarted(s, clock, date)).length;

  // 看著畫面時：開考播一聲、考完響三聲。剛打開頁面、或剛改過時間表時已經過的不算
  const last = useRef<{
    slots: ExamSlot[];
    started: number;
    over: number;
  } | null>(null);
  useEffect(() => {
    const prev = last.current;
    last.current = { slots, started, over: examsOver };
    if (!prev || prev.slots !== slots || !soundOn) return;
    const ended = examsOver > prev.over;
    if (ended) {
      [0, 520, 1040].forEach((d) => window.setTimeout(playBonusSound, d));
    }
    // 上一科結束與下一科開始在同一刻時，等鈴響完再播開考，兩個聲音才分得出來
    if (started > prev.started) {
      window.setTimeout(playGoSound, ended ? 1800 : 0);
    }
  }, [slots, started, examsOver, soundOn, playBonusSound, playGoSound]);

  return (
    <div
      data-exam-layout
      className="flex w-full flex-col items-center gap-8 lg:flex-row lg:gap-16 lg:items-center lg:justify-center"
    >
      <TimerDial
        remaining={remaining}
        total={total}
        done={allOver}
        warnAt={running && !slot?.rest ? warnMin * 60 : 0}
        // 不是在考試的時候（等下一節、午休中）環都是綠的，只有考試中是藍的
        rest={!allOver && (!running || !!slot?.rest)}
        announce={startBanner(slots, state)}
        caption={
          slot && !running && !allOver
            ? {
                label: slot.rest ? "接下來" : "下堂考試",
                title: slot.subject,
              }
            : null
        }
      />

      <div className="w-full max-w-sm space-y-3">
        {slots.map((s, i) => {
          const active = i === index && running;
          const past = isOver(s, clock, date);
          if (s.rest) {
            return (
              <div
                key={s.id}
                className={`${active ? "text-rest" : past ? "text-ink-soft/40" : "text-ink-soft/70"} flex items-center gap-3 py-1 text-sm font-semibold`}
              >
                <span className="bg-ink/15 h-px flex-1" />
                <span className="tabular-nums">
                  {s.subject} {s.start}–{s.end}
                </span>
                <span className="bg-ink/15 h-px flex-1" />
              </div>
            );
          }
          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 rounded-2xl px-5 py-4 transition-[background-color,color] duration-150 ${
                active
                  ? "bg-ink text-paper"
                  : past
                    ? "text-ink-soft/40 bg-transparent"
                    : "bg-paper-warm text-ink"
              }`}
            >
              <span
                className={`flex-1 text-xl font-bold ${past ? "line-through" : ""}`}
              >
                {s.subject}
              </span>
              <span className="text-base font-semibold tabular-nums">
                {s.start}–{s.end}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
