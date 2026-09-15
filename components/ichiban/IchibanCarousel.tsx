"use client";

import { carouselRotationFromDrag, carouselTargetForIndex, snapCarousel } from "@/lib/ichiban/carousel";
import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { IchibanCarouselScene } from "./IchibanCarouselScene";
import type { IchibanPrize } from "./IchibanTearCard";
import styles from "./IchibanCarousel.module.css";

const prizes: IchibanPrize[] = [
  { rank: "A賞", name: "星空投影燈", message: "恭喜抽中頭獎！" },
  { rank: "B賞", name: "造型抱枕", message: "今天的好運抱回家！" },
  { rank: "C賞", name: "桌上收納盒", message: "讓桌面多一點好心情！" },
  { rank: "D賞", name: "彩色隨行杯", message: "帶著幸運一起出門！" },
  { rank: "E賞", name: "角色小毛巾", message: "實用又可愛的小驚喜！" },
  { rank: "F賞", name: "收藏徽章組", message: "抽到專屬於你的款式！" },
  { rank: "最後賞", name: "限定大型玩偶", message: "壓軸幸運降臨！" },
];

export function IchibanCarousel({ onSelect }: { onSelect: (prize: IchibanPrize) => void }) {
  const reduceMotion = useReducedMotion();
  const rotation = useMotionValue(0);
  const drag = useRef<{ pointerId: number; startX: number; startRotation: number } | null>(null);
  const moved = useRef(false);
  const ignoreClick = useRef(false);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const clickTimer = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [modelState, setModelState] = useState<"loading" | "ready" | "error">("loading");
  const handleReady = useCallback(() => setModelState("ready"), []);
  const handleError = useCallback(() => setModelState("error"), []);

  useEffect(
    () => () => {
      animation.current?.stop();
      if (clickTimer.current !== null) window.clearTimeout(clickTimer.current);
    },
    [],
  );

  const moveTo = (index: number, chooseAfter = false) => {
    animation.current?.stop();
    const target = carouselTargetForIndex(index, prizes.length, rotation.get());
    setActiveIndex(index);
    if (reduceMotion) {
      rotation.set(target);
      if (chooseAfter) onSelect(prizes[index]);
      return;
    }
    animation.current = animate(rotation, target, { type: "spring", stiffness: 190, damping: 25, mass: 0.82 });
    if (chooseAfter) animation.current.then(() => onSelect(prizes[index]));
  };

  const release = (pointerId: number) => {
    if (drag.current?.pointerId !== pointerId) return;
    const snapped = snapCarousel(rotation.get(), prizes.length);
    drag.current = null;
    setDragging(false);
    ignoreClick.current = moved.current;
    clickTimer.current = window.setTimeout(() => {
      ignoreClick.current = false;
    }, 0);
    moveTo(snapped.index);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    animation.current?.stop();
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startRotation: rotation.get() };
    moved.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.current.startX;
    if (Math.abs(deltaX) > 6) moved.current = true;
    rotation.set(carouselRotationFromDrag(drag.current.startRotation, deltaX));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveTo((activeIndex - 1 + prizes.length) % prizes.length);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveTo((activeIndex + 1) % prizes.length);
    }
  };

  return (
    <section className={`${styles.stage} relative overflow-hidden rounded-3xl border border-ink/10 px-3 py-8 sm:px-8 sm:py-11`}>
      <div className="relative z-[1] text-center">
        <p className="font-display text-brand-red text-sm font-black tracking-[0.16em]">一番賞</p>
        <h1 className="font-display text-ink mt-2 text-3xl font-black tracking-tight sm:text-4xl">挑一張幸運籤</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">左右拖曳旋轉票券，點一下選中的票券。</p>
      </div>

      <div
        aria-label="一番賞 3D 票券輪播"
        className={`${styles.viewport} relative mx-auto mt-3 h-[390px] w-full max-w-[760px] touch-none overflow-hidden rounded-2xl outline-offset-4 sm:h-[430px] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        <div className={`${styles.floor} pointer-events-none absolute bottom-4 left-1/2 h-24 w-[72%] -translate-x-1/2 rounded-full`} />
        <div className="absolute inset-0">
          <IchibanCarouselScene
            rotation={rotation}
            count={prizes.length}
            activeIndex={activeIndex}
            onTicketClick={(index) => {
              if (!ignoreClick.current) moveTo(index, true);
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(event) => release(event.pointerId)}
            onPointerCancel={(event) => release(event.pointerId)}
            onKeyDown={handleKeyDown}
            onReady={handleReady}
            onError={handleError}
          />
        </div>
        {modelState === "loading" && (
          <div className="bg-paper-warm absolute inset-[18%_12%] flex animate-pulse items-center justify-center rounded-2xl text-sm font-bold text-ink-soft">
            正在排列 3D 票券…
          </div>
        )}
        {modelState === "error" && (
          <div className="bg-paper-warm absolute inset-[18%_12%] flex items-center justify-center rounded-2xl border border-ink/10 px-5 text-center text-sm font-bold text-ink-soft">
            3D 票券無法載入，請重新整理後再試。
          </div>
        )}
      </div>

      <p className="text-ink-soft -mt-5 text-center text-xs font-bold sm:text-sm">也可以使用左右方向鍵，按 Enter 選擇</p>
    </section>
  );
}
