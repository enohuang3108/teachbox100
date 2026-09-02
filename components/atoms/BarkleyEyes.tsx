"use client";

import { useEffect, useRef } from "react";

/**
 * 阿黃的眼珠跟著滑鼠轉。
 *
 * 眼白是照著 barkley.webp 量出來的橢圓（1024 見方的原圖座標），直接蓋在原本
 * 那兩顆眼睛上，所以圖片本身不用改：白橢圓遮掉畫死的眼珠，上面那顆黑點才是會動的。
 * SVG 用同一個 viewBox 疊在 object-contain 的方圖上，縮放怎麼變都對得起來。
 */
const EYES = [
  { cx: 417.8, cy: 289.6, rx: 40, ry: 49.2, rot: 32.7 },
  { cx: 541.4, cy: 342, rx: 40.4, ry: 49.1, rot: 31.7 },
];
const PUPIL_R = 22.5;
// 眼珠最多離開眼白中心多少（原圖單位），留得比 rx - PUPIL_R 小才不會凸出眼白
const TRAVEL = 15;

export function BarkleyEyes() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const update = () => {
      frame = 0;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect?.width) return;
      const scale = rect.width / 1024;

      EYES.forEach((eye, i) => {
        const pupil = pupilsRef.current[i];
        if (!pupil) return;
        const dx = pointerX - (rect.left + eye.cx * scale);
        const dy = pointerY - (rect.top + eye.cy * scale);
        const dist = Math.hypot(dx, dy) || 1;
        // 滑鼠貼在臉上時只轉一點點，離開約一個身體遠就轉到底
        const reach = Math.min(dist / (rect.width * 0.6), 1) * TRAVEL;
        pupil.setAttribute(
          "transform",
          `translate(${((dx / dist) * reach).toFixed(2)} ${((dy / dist) * reach).toFixed(2)})`,
        );
      });
    };

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1024 1024"
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    >
      {EYES.map((eye) => (
        <ellipse
          key={eye.cx}
          cx={eye.cx}
          cy={eye.cy}
          rx={eye.rx}
          ry={eye.ry}
          transform={`rotate(${eye.rot} ${eye.cx} ${eye.cy})`}
          fill="#fcfbfc"
        />
      ))}
      {EYES.map((eye, i) => (
        <circle
          key={eye.cx}
          ref={(el) => {
            pupilsRef.current[i] = el;
          }}
          cx={eye.cx}
          cy={eye.cy}
          r={PUPIL_R}
          fill="#0d0d0d"
        />
      ))}
    </svg>
  );
}
