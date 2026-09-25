"use client";

import confetti from "canvas-confetti";
import { useEffect, useRef, useState } from "react";
import { StageFixed } from "@/components/templates/StageFixed";

type Fire = confetti.CreateTypes;

/**
 * 紙屑用的全螢幕 canvas，portal 進 #game-stage，全螢幕投影時也看得到
 * （canvas-confetti 預設掛在 body，全螢幕時會被擋在外面）。
 * onReady 拿到 fire 後排自己的時序，回傳的清理函式在卸載時跑；降低動態效果時不噴。
 */
export function StageConfetti({
  onReady,
}: {
  onReady: (fire: Fire) => (() => void) | void;
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const ready = useRef(onReady);
  useEffect(() => {
    ready.current = onReady;
  });

  useEffect(() => {
    if (!canvas) return;
    const fire = confetti.create(canvas, {
      resize: true,
      disableForReducedMotion: true,
    });
    const cleanup = ready.current(fire);
    return () => {
      cleanup?.();
      fire.reset();
    };
  }, [canvas]);

  return (
    <StageFixed>
      <canvas
        ref={setCanvas}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-(--z-overlay) size-full"
      />
    </StageFixed>
  );
}
