"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Input } from "@/components/atoms/shadcn/input";
import { DatePicker } from "@/components/timer/DatePicker";
import { OptionPills } from "@/components/molecules/OptionPills";
import { StepSetup } from "@/components/organisms/StepSetup";
import {
  examError,
  toMinutes,
  type ExamError,
  type ExamSlot,
} from "@/lib/timer/exam";
import type { TimerMode } from "@/lib/timer/share";
import { useTimerStore } from "@/lib/timer/store";
import { PRESETS } from "@/lib/timer/timer";
import { CalendarClock, Hourglass, Timer } from "lucide-react";
import { useState } from "react";

const MODES: { value: TimerMode; label: string; hint: string }[] = [
  {
    value: "timer",
    label: "計時器",
    hint: "分組討論、限時作答用：選好長度，按開始才倒數，中途可以暫停、加時。",
  },
  {
    value: "exam",
    label: "考試時間",
    hint: "排好一天的科目與午休，跟著真實時間自動開始、換科、響鈴，不用按開始。",
  },
];

/** "2026-10-02" → "10/2" */
const shortDate = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}/${d}`;
};

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { mode, seconds, date, slots, warnMin, setMode, setSeconds } =
    useTimerStore();
  const error =
    mode === "exam" ? examError(date, slots, new Date()) : undefined;

  return (
    <StepSetup
      title="計時器設定"
      blocker={error?.message}
      startLabel="開始"
      share={{ unit: "timer", setup: { mode, seconds, date, slots, warnMin } }}
      onStart={onStart}
      steps={[
        {
          key: "mode",
          label: "模式",
          icon: Timer,
          summary: MODES.find((m) => m.value === mode)!.label,
          content: (
            <section className="space-y-3">
              <header>
                <h3 className="text-h3 text-ink">要用哪一種？</h3>
                <DialogDescription className="mt-1">
                  開始之後隨時可以從右上角的設定換。
                </DialogDescription>
              </header>
              <OptionPills
                name="timer-mode"
                value={mode}
                onChange={setMode}
                options={MODES.map((m) => ({ value: m.value, label: m.label }))}
              />
              <p className="text-caption text-muted-foreground">
                {MODES.find((m) => m.value === mode)!.hint}
              </p>
            </section>
          ),
        },
        mode === "timer"
          ? {
              key: "time",
              label: "時間",
              icon: Hourglass,
              summary: `${seconds / 60} 分鐘`,
              content: (
                <section className="space-y-3">
                  <header>
                    <h3 className="text-h3 text-ink">倒數多久？</h3>
                    <DialogDescription className="mt-1">
                      按開始就倒數。之後也能從右下角換時間，或按「+1 分」加時。
                    </DialogDescription>
                  </header>
                  <OptionPills
                    name="timer-seconds"
                    value={seconds}
                    onChange={setSeconds}
                    options={PRESETS.map((s) => ({
                      value: s,
                      label: `${s / 60} 分鐘`,
                    }))}
                  />
                </section>
              ),
            }
          : {
              key: "exam",
              label: "時間表",
              icon: CalendarClock,
              summary: `${date ? shortDate(date) : "未選日期"}・${slots.filter((s) => !s.rest).length} 科`,
              done: !error,
              content: <ScheduleEditor error={error} />,
            },
      ]}
    />
  );
}

/** 出錯那一節的輸入框框成紅色；錯在哪由底列那句話講 */
const INVALID =
  "aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger/30";

const hhmm = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** 新的一節接在最後一節後面：考試 40 分鐘、休息 60 分鐘，加完就是合理的時間 */
function newSlot(after: string, subject: string, rest: boolean): ExamSlot {
  const start = Math.min(toMinutes(after), 24 * 60 - 1);
  const end = Math.min(start + (rest ? 60 : 40), 24 * 60 - 1);
  return {
    id: crypto.randomUUID(),
    subject,
    start: hhmm(start),
    end: hhmm(end),
    rest,
  };
}

/** 考試日期、節次與變色提醒；直接改 store，開始或關掉視窗都已經存好 */
function ScheduleEditor({ error }: { error?: ExamError }) {
  const { date, slots, warnMin, setDate, setSlots, setWarnMin } =
    useTimerStore();
  const [dragId, setDragId] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);

  /** 把 id 這列搬到 to 的位置；拖曳與方向鍵共用 */
  const move = (id: string, to: number) => {
    const from = slots.findIndex((s) => s.id === id);
    if (from < 0 || to < 0 || to >= slots.length || to === from) return;
    const next = [...slots];
    next.splice(to, 0, ...next.splice(from, 1));
    setSlots(next);
  };

  const patch = (id: string, field: keyof ExamSlot, value: string) =>
    setSlots(slots.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <header>
          <h3 className="text-h3 text-ink">哪一天考？</h3>
          <DialogDescription className="mt-1">
            前一天先排好也可以，還沒到時間會倒數到第一節開始。
          </DialogDescription>
        </header>
        <DatePicker value={date} onChange={setDate} />
      </div>

      <div className="space-y-3">
        <header>
          <h3 className="text-h3 text-ink">考哪幾節？</h3>
          <DialogDescription className="mt-1">
            按住 ⠿ 拖曳可以調整順序。午休這類休息時間也會照表倒數，但不算一科。
          </DialogDescription>
        </header>
        <div className="space-y-3">
          {slots.map((s, i) => (
            <div
              key={s.id}
              // 整列 draggable，但只有按住把手時才打開 —— 不然輸入框連字都選不起來
              draggable={armed === s.id}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                setDragId(s.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setArmed(null);
              }}
              onDragEnter={() => {
                if (dragId && dragId !== s.id) move(dragId, i);
              }}
              onDragOver={(e) => e.preventDefault()}
              // 手機上科目一行、起訖時間換到第二行，不然科目欄會被兩個時間擠成一條縫
              className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg sm:flex ${dragId === s.id ? "opacity-40" : ""}`}
            >
              {/* 原生 drag and drop，不為了排序多裝一包 dnd */}
              <button
                type="button"
                aria-label={`調整 ${s.subject} 的順序`}
                className="text-ink-soft/50 hover:text-ink cursor-grab px-1 text-lg leading-none select-none active:cursor-grabbing"
                onPointerDown={() => setArmed(s.id)}
                onPointerUp={() => setArmed(null)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") move(s.id, i - 1);
                  if (e.key === "ArrowDown") move(s.id, i + 1);
                }}
              >
                ⠿
              </button>
              <Input
                value={s.subject}
                aria-label="科目"
                aria-invalid={error?.slotId === s.id}
                placeholder={s.rest ? "休息" : "科目"}
                className={`min-w-0 flex-1 ${INVALID}`}
                onChange={(e) => patch(s.id, "subject", e.target.value)}
              />
              <div className="col-start-2 row-start-2 flex gap-2 sm:contents">
                <Input
                  type="time"
                  value={s.start}
                  aria-label="開始時間"
                  aria-invalid={error?.slotId === s.id}
                  className={`flex-1 sm:w-32 sm:flex-none ${INVALID}`}
                  onChange={(e) => patch(s.id, "start", e.target.value)}
                />
                <Input
                  type="time"
                  value={s.end}
                  aria-label="結束時間"
                  aria-invalid={error?.slotId === s.id}
                  className={`flex-1 sm:w-32 sm:flex-none ${INVALID}`}
                  onChange={(e) => patch(s.id, "end", e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="col-start-3 row-start-1"
                aria-label={`刪除 ${s.subject}`}
                disabled={slots.length <= 1}
                onClick={() => setSlots(slots.filter((x) => x.id !== s.id))}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { label: "新增一節", rest: false, subject: "" },
            { label: "新增午休", rest: true, subject: "午休" },
          ].map(({ label, rest, subject }) => (
            <Button
              key={label}
              variant="outline"
              onClick={() =>
                setSlots([
                  ...slots,
                  newSlot(slots.at(-1)?.end ?? "08:00", subject, rest),
                ])
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <label className="text-ink-soft flex items-center gap-2 text-sm font-semibold">
        剩下
        <Input
          type="number"
          min={0}
          max={120}
          value={warnMin}
          aria-label="紅色提醒時間（分鐘）"
          className="w-20"
          onChange={(e) =>
            setWarnMin(Math.min(120, Math.max(0, Number(e.target.value) || 0)))
          }
        />
        分鐘時，變色提醒
      </label>
    </section>
  );
}
