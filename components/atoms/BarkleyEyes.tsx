"use client";

import { useEffect, useRef } from "react";

/**
 * 阿黃的眼珠跟著滑鼠轉。
 *
 * 眼白是照著 barkley.webp 量出來的橢圓（1024 見方的原圖座標），直接蓋在原本
 * 那兩顆眼睛上，所以圖片本身不用改：白橢圓遮掉畫死的眼珠，上面那顆黑點才是會動的。
 * SVG 用同一個 viewBox 疊在 object-contain 的方圖上，縮放怎麼變都對得起來。
 */
type Eye = { cx: number; cy: number; rx: number; ry: number; rot: number };

const EYES: Eye[] = [
  { cx: 417.8, cy: 289.6, rx: 40, ry: 49.2, rot: 32.7 },
  { cx: 541.4, cy: 342, rx: 40.4, ry: 49.1, rot: 31.7 },
];
const PUPIL_R = 22.5;
// 眼珠最多離開眼白中心多少（原圖單位），留得比 rx - PUPIL_R 小才不會凸出眼白
const TRAVEL = 15;

/**
 * 預設量的是 barkley.webp。別張圖（例如首頁教具箱裡的阿黃）傳自己量到的眼睛、
 * 圖的原始寬高與眼白色，SVG 一樣用原圖座標疊在 object-contain 的圖上。
 */
export function BarkleyEyes({
  eyes = EYES,
  width = 1024,
  height = 1024,
  pupilR = PUPIL_R,
  travel = TRAVEL,
  eyeFill = "#fcfbfc",
  pupilFill = "#0d0d0d",
  rest,
}: {
  eyes?: Eye[];
  width?: number;
  height?: number;
  pupilR?: number;
  travel?: number;
  eyeFill?: string;
  pupilFill?: string;
  /** 滑鼠還沒動之前眼珠的位置（原圖單位），觸控裝置上就一直停在這裡 */
  rest?: [number, number];
} = {}) {
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
      const scale = rect.width / width;

      eyes.forEach((eye, i) => {
        const pupil = pupilsRef.current[i];
        if (!pupil) return;
        const dx = pointerX - (rect.left + eye.cx * scale);
        const dy = pointerY - (rect.top + eye.cy * scale);
        const dist = Math.hypot(dx, dy) || 1;
        // 滑鼠貼在臉上時只轉一點點，離開約一個身體遠就轉到底
        const reach = Math.min(dist / (rect.width * 0.6), 1) * travel;
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
  }, [eyes, width, travel]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    >
      {eyes.map((eye) => (
        <ellipse
          key={eye.cx}
          cx={eye.cx}
          cy={eye.cy}
          rx={eye.rx}
          ry={eye.ry}
          transform={`rotate(${eye.rot} ${eye.cx} ${eye.cy})`}
          fill={eyeFill}
        />
      ))}
      {eyes.map((eye, i) => (
        <circle
          key={eye.cx}
          ref={(el) => {
            pupilsRef.current[i] = el;
          }}
          cx={eye.cx}
          cy={eye.cy}
          r={pupilR}
          fill={pupilFill}
          transform={rest && `translate(${rest[0]} ${rest[1]})`}
        />
      ))}
    </svg>
  );
}
