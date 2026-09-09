"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * 一行文字在容器寬度內盡量放大：從 max 往下試到塞得進去為止。
 * 格子會隨視窗縮放，所以用 ResizeObserver 重算，大螢幕字自然變大。
 */
export function FitText({
  children,
  min = 10,
  max = 26,
  className = "",
}: {
  children: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(max);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;

    const fit = () => {
      const avail = box.clientWidth;
      if (avail === 0) return;
      // 先量一次 1px 的寬度，再等比推算，省掉逐級試的迴圈
      el.style.fontSize = "100px";
      const widthAt100 = el.scrollWidth;
      if (widthAt100 === 0) return;
      const next = Math.max(
        min,
        Math.min(max, Math.floor((avail / widthAt100) * 100)),
      );
      el.style.fontSize = "";
      setSize(next);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [children, min, max]);

  return (
    <span
      ref={ref}
      className={`block text-center leading-tight whitespace-nowrap ${className}`}
      style={{ fontSize: size }}
    >
      {children}
    </span>
  );
}
