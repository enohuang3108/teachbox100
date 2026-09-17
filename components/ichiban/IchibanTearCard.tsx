"use client";

import { finishTear, tearProgress } from "@/lib/ichiban/tear";
import { useTearSound } from "@/lib/ichiban/useTearSound";
import type { IchibanPrize } from "@/lib/ichiban/prizes";
import { animate, useReducedMotion, type MotionValue } from "motion/react";
import { Button } from "@/components/atoms/shadcn/button";
import { ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// 按下去縮一點，讓按鈕確實「聽到」了；只轉場 transform，不用 transition-all。
export const pressable =
  "font-display rounded-full text-base font-extrabold transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97]";

/** 撕票的操作層：蓋在輪播 canvas 上，只負責把拖曳換成 progress，3D 由同一個場景畫。 */
export function IchibanTearControls({
  prize,
  progress,
  onBack,
  onConfirm,
}: {
  prize: IchibanPrize;
  progress: MotionValue<number>;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const surfaceRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ pointerId: number; startX: number } | null>(null);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [dragging, setDragging] = useState(false);
  /** 封條拉開到 5% 就不能返回換票，免得偷看後反悔 */
  const [torn, setTorn] = useState(false);
  const tearSound = useTearSound();

  useEffect(() => () => animation.current?.stop(), []);

  const travel = () => (surfaceRef.current?.clientWidth ?? 780) * 0.76;

  const settle = (shouldReveal: boolean) => {
    animation.current?.stop();
    const target = shouldReveal ? 1 : 0;
    if (reduceMotion) {
      progress.set(target);
      setRevealed(shouldReveal);
      return;
    }
    animation.current = shouldReveal
      ? animate(progress, target, { duration: 0.48, ease: [0.22, 1, 0.36, 1] })
      : animate(progress, target, {
          type: "spring",
          stiffness: 320,
          damping: 30,
          mass: 0.72,
        });
    if (shouldReveal) {
      animation.current.then(() => setRevealed(true));
    }
  };

  const release = (pointerId?: number) => {
    if (
      !drag.current ||
      (pointerId !== undefined && drag.current.pointerId !== pointerId)
    )
      return;
    const result = finishTear(progress.get());
    drag.current = null;
    setDragging(false);
    tearSound.stop();
    settle(result === "revealed");
  };

  return (
    <>
      <button
        ref={surfaceRef}
        type="button"
        aria-label="按住一番賞票券，從左往右撕開封條"
        className={`absolute inset-x-0 top-0 z-10 mx-auto h-[450px] w-full touch-none rounded-2xl outline-offset-4 sm:h-[500px] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0 || revealed) return;
          animation.current?.stop();
          drag.current = {
            pointerId: event.pointerId,
            startX: event.clientX - progress.get() * travel(),
          };
          setDragging(true);
          tearSound.start();
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return;
          const next = tearProgress(
            drag.current.startX,
            event.clientX,
            travel(),
          );
          tearSound.move(next);
          progress.set(next);
          if (next >= 0.05) setTorn(true);
        }}
        onPointerUp={(event) => release(event.pointerId)}
        onPointerCancel={(event) => release(event.pointerId)}
        onLostPointerCapture={() => release()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            settle(true);
          }
        }}
      >
        <span className="sr-only">從左往右撕開</span>
      </button>

      {revealed && (
        <output className="sr-only">
          抽中{prize.rank}：{prize.name}
        </output>
      )}

      <div className="relative z-10 -mt-5 flex min-h-11 items-center justify-center gap-2">
        {revealed ? (
          // 撕開後結果就定了，只能確認，不能返回重撕。
          <Button
            size="lg"
            onClick={onConfirm}
            className={`${pressable} bg-ink text-paper hover:bg-ink/90 px-6 shadow-sm`}
          >
            確認
          </Button>
        ) : (
          <>
            {!torn && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  animation.current?.stop();
                  tearSound.stop();
                  onBack();
                }}
                className={`${pressable} border-ink/15 bg-paper text-ink-soft hover:bg-paper-warm hover:text-ink px-5`}
              >
                <ChevronLeft aria-hidden strokeWidth={2.4} />
                返回
              </Button>
            )}
            <Button
              size="lg"
              onClick={() => settle(true)}
              className={`${pressable} bg-ink text-paper hover:bg-ink/90 px-6 shadow-sm`}
            >
              直接揭曉
            </Button>
          </>
        )}
      </div>
    </>
  );
}
