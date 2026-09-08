"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";
import { Input } from "@/components/atoms/shadcn/input";
import { TimerDial } from "@/components/timer/TimerDial";
import { useSound } from "@/lib/hooks/useSound";
import {
  currentSlotIndex,
  DEFAULT_SLOTS,
  DEFAULT_WARN_MIN,
  EXAM_STORAGE_KEY,
  EXAM_WARN_KEY,
  slotSeconds,
  type ExamSlot,
} from "@/lib/timer/exam";
import { useEffect, useState } from "react";

/**
 * 考試模式：倒數綁牆上時鐘，沒有開始／暫停也沒有加時間 ——
 * 考試幾點結束就是幾點結束，能按的只有「現在看哪一科」。
 */
export function ExamMode({ soundOn }: { soundOn: boolean }) {
  const [slots, setSlots] = useState<ExamSlot[]>(DEFAULT_SLOTS);
  const [picked, setPicked] = useState<string | null>(null);
  const [endAt, setEndAt] = useState<number | null>(null);
  /** 真的整段跑完的科目才算結束；中途按停止或還沒到時間都不算 */
  const [finished, setFinished] = useState<string[]>([]);
  const [warnMin, setWarnMin] = useState(DEFAULT_WARN_MIN);
  const [now, setNow] = useState(() => Date.now());
  const { playBonusSound } = useSound();

  useEffect(() => {
    const saved = localStorage.getItem(EXAM_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) setSlots(parsed);
      } catch {
        // 壞掉的舊資料就當沒設定過
      }
    }
    const w = Number(localStorage.getItem(EXAM_WARN_KEY));
    if (w > 0) setWarnMin(w);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);

  // 一進來預設停在時間表上「現在這一節」，老師不用自己找
  useEffect(() => {
    const i = currentSlotIndex(slots, new Date());
    if (i >= 0) setPicked(slots[i].id);
  }, [slots]);

  const found = slots.findIndex((s) => s.id === picked);
  const index = found >= 0 ? found : slots.findIndex((s) => !s.rest);
  const slot = slots[index];
  const total = slot ? slotSeconds(slot) : 0;
  // 按下的瞬間 now 最舊可能落後 100ms，不夾住上限就會先閃一個「多一秒」。
  // 再減 1 秒是為了按下立刻就往下跳，而不是先停在整數上乾等一秒。
  const left = endAt === null ? total : Math.max(0, (endAt - now) / 1000);
  const remaining =
    endAt === null ? total : Math.min(total, Math.max(0, left - 1));
  const done = endAt !== null && left <= 0;

  // 響鈴三聲。切科目會把 endAt 清掉，所以不會被別科的結束誤觸。
  useEffect(() => {
    if (!done) return;
    setFinished((prev) => (prev.includes(slot.id) ? prev : [...prev, slot.id]));
  }, [done, slot?.id]);

  useEffect(() => {
    if (!done || !soundOn) return;
    const ids = [0, 520, 1040].map((d) => window.setTimeout(playBonusSound, d));
    return () => ids.forEach(window.clearTimeout);
  }, [done, soundOn, playBonusSound]);

  const pick = (id: string) => {
    setPicked(id);
    setEndAt(null);
  };

  const save = (next: ExamSlot[], warn: number) => {
    setSlots(next);
    setWarnMin(warn);
    localStorage.setItem(EXAM_WARN_KEY, String(warn));
    setPicked(null);
    setEndAt(null);
    setFinished([]);
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div
      data-exam-layout
      className="flex w-full flex-col items-center gap-8 lg:flex-row lg:gap-16 lg:items-center lg:justify-center"
    >
      <TimerDial
        remaining={remaining}
        total={total}
        done={done}
        warnAt={warnMin * 60}
      />

      <div className="w-full max-w-sm space-y-3">
        {slots.map((s, i) => {
          if (s.rest) {
            return (
              <div
                key={s.id}
                className="text-ink-soft/70 flex items-center gap-3 py-1 text-sm font-semibold"
              >
                <span className="bg-ink/15 h-px flex-1" />
                <span className="tabular-nums">
                  {s.subject} {s.start}–{s.end}
                </span>
                <span className="bg-ink/15 h-px flex-1" />
              </div>
            );
          }
          const active = i === index;
          const past = finished.includes(s.id);
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
              <button
                type="button"
                aria-pressed={active}
                onClick={() => pick(s.id)}
                className="flex flex-1 items-baseline justify-between gap-3 text-left"
              >
                <span
                  className={`text-xl font-bold ${past ? "line-through" : ""}`}
                >
                  {s.subject}
                </span>
                <span className="text-base font-semibold tabular-nums">
                  {s.start}–{s.end}
                </span>
              </button>
              {active && (
                <Button
                  size="sm"
                  className="bg-brand-yellow text-ink hover:bg-brand-yellow/85 shrink-0 font-bold"
                  disabled={total <= 0}
                  onClick={() =>
                    setEndAt(endAt === null ? Date.now() + total * 1000 : null)
                  }
                >
                  {endAt === null ? "考試開始" : "停止"}
                </Button>
              )}
            </div>
          );
        })}

        <SlotSettings slots={slots} warnMin={warnMin} onSave={save} />
      </div>
    </div>
  );
}

function SlotSettings({
  slots,
  warnMin,
  onSave,
}: {
  slots: ExamSlot[];
  warnMin: number;
  onSave: (next: ExamSlot[], warnMin: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(slots);
  const [warn, setWarn] = useState(String(warnMin));

  const [dragId, setDragId] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);

  /** 把 id 這列搬到 to 的位置；拖曳與方向鍵共用 */
  const move = (id: string, to: number) =>
    setDraft((prev) => {
      const from = prev.findIndex((s) => s.id === id);
      if (from < 0 || to < 0 || to >= prev.length || to === from) return prev;
      const next = [...prev];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });

  const patch = (id: string, field: keyof ExamSlot, value: string) =>
    setDraft((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) {
          setDraft(slots);
          setWarn(String(warnMin));
        }
        setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          設定考試時間
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>考試時間</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-1">
          {draft.map((s, i) => (
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
              className={`flex items-center gap-2 rounded-lg ${dragId === s.id ? "opacity-40" : ""}`}
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
                placeholder="科目"
                className="flex-1"
                onChange={(e) => patch(s.id, "subject", e.target.value)}
              />
              <Input
                type="time"
                value={s.start}
                aria-label="開始時間"
                className="w-32"
                onChange={(e) => patch(s.id, "start", e.target.value)}
              />
              <Input
                type="time"
                value={s.end}
                aria-label="結束時間"
                className="w-32"
                onChange={(e) => patch(s.id, "end", e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`刪除 ${s.subject}`}
                disabled={draft.length <= 1}
                onClick={() =>
                  setDraft((prev) => prev.filter((x) => x.id !== s.id))
                }
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
                setDraft((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    subject,
                    start: prev.at(-1)?.end ?? "08:00",
                    end: prev.at(-1)?.end ?? "08:40",
                    rest,
                  },
                ])
              }
            >
              {label}
            </Button>
          ))}
        </div>
        <label className="text-ink-soft flex items-center gap-2 text-sm font-semibold">
          剩下
          <Input
            type="number"
            min={0}
            max={120}
            value={warn}
            aria-label="紅色提醒時間（分鐘）"
            className="w-20"
            onChange={(e) => setWarn(e.target.value)}
          />
          分鐘時，變色提醒
        </label>
        <DialogFooter>
          <Button
            onClick={() => {
              onSave(
                draft.map((s) => ({ ...s, subject: s.subject || "科目" })),
                Math.min(120, Math.max(0, Number(warn) || 0)),
              );
              setOpen(false);
            }}
          >
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
