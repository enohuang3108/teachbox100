"use client";

import {
  carouselRotationFromDrag,
  carouselTargetForIndex,
  flingCarousel,
  snapCarousel,
} from "@/lib/ichiban/carousel";
import { animate, useMotionValue, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { IchibanCarouselScene } from "./IchibanCarouselScene";
import { IchibanTearControls, pressable } from "./IchibanTearCard";
import { Button } from "@/components/atoms/shadcn/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIchibanStore } from "@/lib/ichiban/store";
import type { IchibanPrize } from "@/lib/ichiban/prizes";
import styles from "./IchibanCarousel.module.css";

const focusEase = [0.65, 0, 0.35, 1] as const;

export function IchibanCarousel() {
  const prizes = useIchibanStore((state) => state.prizes);
  const pool = useIchibanStore((state) => state.pool);
  const count = pool.length;
  const confirmDraw = useIchibanStore((state) => state.confirmDraw);
  const reduceMotion = useReducedMotion();
  const rotation = useMotionValue(0);
  const focus = useMotionValue(0);
  const progress = useMotionValue(0);
  const choosing = useRef(false);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startRotation: number;
    lastX: number;
    lastTime: number;
    /** 旋轉速度（度/秒），放手時用來甩動慣性。 */
    velocity: number;
  } | null>(null);
  const moved = useRef(false);
  const ignoreClick = useRef(false);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const clickTimer = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chosen, setChosen] = useState(false);
  const [prize, setPrize] = useState<IchibanPrize | null>(null);
  const [dragging, setDragging] = useState(false);
  const [modelState, setModelState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
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
    if (choosing.current) return;
    animation.current?.stop();
    const target = carouselTargetForIndex(index, count, rotation.get());
    setActiveIndex(index);
    if (chooseAfter) {
      choosing.current = true;
      setChosen(true);
    }
    if (reduceMotion) {
      rotation.set(target);
      if (chooseAfter) {
        focus.set(1);
        setPrize(prizes[pool[index]]);
      }
      return;
    }
    animation.current = animate(rotation, target, {
      type: "spring",
      stiffness: 190,
      damping: 25,
      mass: 0.82,
    });
    if (chooseAfter) {
      animation.current
        .then(() => {
          animation.current = animate(focus, 1, {
            duration: 0.75,
            ease: focusEase,
          });
          return animation.current;
        })
        .then(() => setPrize(prizes[pool[index]]));
    }
  };

  const backToCarousel = () => {
    setPrize(null);
    progress.set(0);
    const done = () => {
      choosing.current = false;
      setChosen(false);
    };
    animation.current?.stop();
    if (reduceMotion) {
      focus.set(0);
      done();
      return;
    }
    animation.current = animate(focus, 0, { duration: 0.6, ease: focusEase });
    animation.current.then(done);
  };

  const release = (pointerId: number) => {
    if (drag.current?.pointerId !== pointerId) return;
    const { velocity } = drag.current;
    drag.current = null;
    setDragging(false);
    ignoreClick.current = moved.current;
    clickTimer.current = window.setTimeout(() => {
      ignoreClick.current = false;
    }, 0);
    if (reduceMotion || Math.abs(velocity) < 120) {
      moveTo(snapCarousel(rotation.get(), count).index);
      return;
    }
    // 甩得快就順著慣性一直轉，速度掉下來後停在最近的一張。
    const flung = flingCarousel(rotation.get(), velocity, count);
    setActiveIndex(flung.index);
    animation.current = animate(rotation, flung.rotation, {
      type: "spring",
      velocity,
      stiffness: 40,
      damping: 14,
      mass: 1,
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0 || choosing.current) return;
    animation.current?.stop();
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startRotation: rotation.get(),
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
    moved.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.current.startX;
    if (Math.abs(deltaX) > 6) moved.current = true;
    const dt = (event.timeStamp - drag.current.lastTime) / 1000;
    if (dt > 0) {
      const instant = carouselRotationFromDrag(0, event.clientX - drag.current.lastX) / dt;
      drag.current.velocity = drag.current.velocity * 0.4 + instant * 0.6;
      drag.current.lastX = event.clientX;
      drag.current.lastTime = event.timeStamp;
    }
    rotation.set(carouselRotationFromDrag(drag.current.startRotation, deltaX));
  };

  // 箭頭按鈕：點一下轉一格；長按超過 300ms 就持續旋轉，放開停在最近的一張。
  const hold = useRef<{ timer: number; frame: number | null; last: number } | null>(null);
  const HOLD_SPEED = 160; // 度/秒

  const startHold = (direction: 1 | -1) => {
    if (choosing.current || count === 0) return;
    stopHold(false);
    const state = { timer: 0, frame: null as number | null, last: 0 };
    state.timer = window.setTimeout(() => {
      animation.current?.stop();
      state.last = performance.now();
      const tick = (now: number) => {
        // 往右看下一張 = 旋轉角度遞減。
        rotation.set(rotation.get() - direction * HOLD_SPEED * ((now - state.last) / 1000));
        state.last = now;
        state.frame = requestAnimationFrame(tick);
      };
      state.frame = requestAnimationFrame(tick);
    }, 300);
    hold.current = state;
    holdDirection.current = direction;
  };

  const holdDirection = useRef<1 | -1>(1);
  const stopHold = (commit = true) => {
    const state = hold.current;
    if (!state) return;
    hold.current = null;
    window.clearTimeout(state.timer);
    if (!commit) {
      if (state.frame !== null) cancelAnimationFrame(state.frame);
      return;
    }
    if (state.frame === null) {
      moveTo((activeIndex + holdDirection.current + count) % count);
    } else {
      cancelAnimationFrame(state.frame);
      moveTo(snapCarousel(rotation.get(), count).index);
    }
  };

  useEffect(() => () => stopHold(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveTo((activeIndex - 1 + count) % count);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveTo((activeIndex + 1) % count);
    }
  };

  return (
    <section className="relative select-none">
      <h1 className="sr-only">
        {prize ? "一番賞：沿著封條撕開" : "一番賞：挑一張幸運籤"}
      </h1>
      <div
        aria-label="一番賞 3D 票券"
        className={`${styles.viewport} relative mx-auto h-[450px] w-full touch-none overflow-visible rounded-2xl outline-offset-4 sm:h-[500px] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        <div
          className={`${styles.floor} pointer-events-none absolute bottom-4 left-1/2 h-24 w-[72%] -translate-x-1/2 rounded-full transition-opacity duration-300 ${chosen ? "opacity-0" : ""}`}
        />
        {/* 畫布左右各多出 30%，撕下往右飛的封條才不會被畫布邊緣切掉。 */}
        <div className="absolute inset-y-0 -inset-x-[30%]">
          <IchibanCarouselScene
            rotation={rotation}
            focus={focus}
            progress={progress}
            prize={prize}
            count={count}
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
        {modelState !== "error" && (
          // 骨架照輪播實際的三張直立票券排，載好後淡出，畫面不會從灰方塊跳成票券。
          <div
            aria-hidden={modelState === "ready"}
            className={`${styles.skeleton} pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out ${modelState === "ready" ? "opacity-0" : ""}`}
          >
            <div className={`${styles.ticket} ${styles.side} ${styles.left}`} />
            <div className={`${styles.ticket} ${styles.center}`} />
            <div className={`${styles.ticket} ${styles.side} ${styles.right}`} />
            <span className="sr-only">正在排列 3D 票券…</span>
          </div>
        )}
        {count === 0 && modelState === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center text-center font-display text-2xl font-extrabold text-ink-soft">
            籤全部抽完了，到設定重新開一套
          </div>
        )}
        {modelState === "error" && (
          <div className="bg-paper-warm absolute inset-[18%_12%] flex items-center justify-center rounded-2xl border border-ink/10 px-5 text-center text-sm font-bold text-ink-soft">
            3D 票券無法載入，請重新整理後再試。
          </div>
        )}
      </div>

      {prize ? (
        <IchibanTearControls
          key={prize.rank}
          prize={prize}
          progress={progress}
          onBack={backToCarousel}
          onConfirm={() => {
            confirmDraw(activeIndex);
            // 抽走的票從輪播移除，停在原位置的下一張（最後一張就回到第一張）。
            const nextIndex = count > 1 ? activeIndex % (count - 1) : 0;
            setActiveIndex(nextIndex);
            rotation.set(carouselTargetForIndex(nextIndex, Math.max(1, count - 1), rotation.get()));
            backToCarousel();
          }}
        />
      ) : (
        // 佔住按鈕列的高度，選中後按鈕出現時下方內容才不會跳。
        <div className="relative z-10 -mt-5 flex min-h-11 items-center justify-center gap-24">
          {count > 1 &&
            ([
              [-1, "上一張", ChevronLeft],
              [1, "下一張", ChevronRight],
            ] as const).map(([direction, label, Icon]) => (
              <Button
                key={label}
                variant="outline"
                size="icon"
                aria-label={`${label}（長按連續旋轉）`}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  startHold(direction);
                }}
                onPointerUp={() => stopHold()}
                onPointerCancel={() => stopHold()}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  moveTo((activeIndex + direction + count) % count);
                }}
                onContextMenu={(event) => event.preventDefault()}
                className={`${pressable} border-ink/15 bg-paper text-ink hover:bg-paper-warm size-11 rounded-full`}
              >
                <Icon aria-hidden strokeWidth={2.4} />
              </Button>
            ))}
        </div>
      )}
    </section>
  );
}
