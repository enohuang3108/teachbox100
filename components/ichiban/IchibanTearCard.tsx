"use client";

import { finishTear, tearProgress } from "@/lib/ichiban/tear";
import { animate, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IchibanTicket3D } from "./IchibanTicket3D";
import styles from "./IchibanTearCard.module.css";

export interface IchibanPrize {
  rank: string;
  name: string;
  message: string;
}

const defaultPrize: IchibanPrize = {
  rank: "A賞",
  name: "星空投影燈",
  message: "恭喜抽中頭獎！",
};

export function IchibanTearCard({ prize = defaultPrize }: { prize?: IchibanPrize }) {
  const reduceMotion = useReducedMotion();
  const ticketRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; startX: number } | null>(null);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const coverX = useMotionValue(0);
  const [travel, setTravel] = useState(480);
  const [revealed, setRevealed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [modelState, setModelState] = useState<"loading" | "ready" | "error">("loading");
  const progress = useTransform(coverX, [0, travel], [0, 1]);
  const handleReady = useCallback(() => setModelState("ready"), []);
  const handleError = useCallback(() => setModelState("error"), []);

  useEffect(() => {
    const ticket = ticketRef.current;
    if (!ticket) return;
    const resize = () => setTravel(ticket.clientWidth * 0.76);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(ticket);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => animation.current?.stop(), []);

  const settle = (shouldReveal: boolean) => {
    animation.current?.stop();
    const target = shouldReveal ? travel : 0;
    if (reduceMotion) {
      coverX.set(target);
      setRevealed(shouldReveal);
      return;
    }
    animation.current = shouldReveal
      ? animate(coverX, target, { duration: 0.48, ease: [0.22, 1, 0.36, 1] })
      : animate(coverX, target, { type: "spring", stiffness: 320, damping: 30, mass: 0.72 });
    if (shouldReveal) animation.current.then(() => setRevealed(true));
  };

  const release = (pointerId?: number) => {
    if (!drag.current || (pointerId !== undefined && drag.current.pointerId !== pointerId)) return;
    const result = finishTear(coverX.get() / travel);
    drag.current = null;
    setDragging(false);
    settle(result === "revealed");
  };

  const reset = () => {
    drag.current = null;
    setDragging(false);
    setRevealed(false);
    settle(false);
  };

  return (
    <section className={`${styles.stagePattern} relative overflow-hidden rounded-3xl border border-ink/10 px-4 py-8 sm:px-8 sm:py-12`}>
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <div className="mb-7 text-center">
          <p className="font-display text-brand-red text-sm font-black tracking-[0.16em]">一番賞</p>
          <h1 className="font-display text-ink mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {revealed ? "抽獎結果" : "沿著封條撕開"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {revealed ? "獎項已揭曉，可以重新體驗撕籤。" : "按住票券，從左往右拉開封條。"}
          </p>
        </div>

        <div className="w-full py-4 sm:py-8">
          <div ref={ticketRef} className="relative mx-auto aspect-[1.72/1] w-full max-w-[760px] select-none sm:aspect-[2.15/1]">
            <button
              type="button"
              aria-label="按住一番賞票券，從左往右撕開封條"
              className={`absolute inset-0 z-10 touch-none rounded-2xl outline-offset-4 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
              onPointerDown={(event) => {
                if (!event.isPrimary || event.button !== 0 || revealed) return;
                animation.current?.stop();
                drag.current = { pointerId: event.pointerId, startX: event.clientX - coverX.get() };
                setDragging(true);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (drag.current?.pointerId !== event.pointerId) return;
                coverX.set(tearProgress(drag.current.startX, event.clientX, travel) * travel);
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

            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <IchibanTicket3D progress={progress} prize={prize} onReady={handleReady} onError={handleError} />
            </div>

            {modelState === "loading" && (
              <div className="bg-paper-warm absolute inset-[16%_5%] flex animate-pulse items-center justify-center rounded-2xl text-sm font-bold text-ink-soft">
                正在準備 3D 票券…
              </div>
            )}
            {modelState === "error" && (
              <div className="bg-paper-warm absolute inset-[16%_5%] flex items-center justify-center rounded-2xl border border-ink/10 px-5 text-center text-sm font-bold text-ink-soft">
                3D 票券無法載入，仍可使用下方按鈕揭曉。
              </div>
            )}

          </div>
        </div>

        {revealed && <output className="sr-only">抽中{prize.rank}：{prize.name}。{prize.message}</output>}

        <div className="mt-5 flex min-h-11 items-center justify-center">
          {revealed ? (
            <button
              type="button"
              onClick={reset}
              className="bg-ink text-paper hover:bg-ink/90 inline-flex min-h-11 items-center gap-2 rounded-full px-6 font-extrabold shadow-sm transition-transform active:scale-[0.98]"
            >
              <RotateCcw aria-hidden size={18} strokeWidth={2.2} />
              再撕一次
            </button>
          ) : (
            <button
              type="button"
              onClick={() => settle(true)}
              className="text-ink-soft hover:text-ink min-h-11 rounded-full px-5 text-sm font-bold underline decoration-ink/25 underline-offset-4 active:translate-y-px"
            >
              無法拖曳？直接揭曉
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
