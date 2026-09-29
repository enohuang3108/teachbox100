"use client";

import { trace, type Ladder } from "@/lib/ladder/game";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

/** 每個人一個路線色，依名單順序輪流；黃色放最後，細線時比較不顯眼 */
export const PATH_COLORS = [
  "var(--brand-red)",
  "var(--brand-blue)",
  "var(--brand-green)",
  "var(--brand-yellow)",
];
export const colorOf = (player: number) => PATH_COLORS[player % PATH_COLORS.length];

/** 線多的時候名字改直書、線條變細，30 條線才塞得進一個投影畫面 */
const DENSE = 10;

type Point = [number, number];

/** 把 [直線, 高度] 換成 viewBox 0–100 的座標 */
const toView = (ladder: Ladder, [col, height]: Point): Point => [
  ((col + 0.5) / ladder.columns) * 100,
  (height / (ladder.rows.length + 1)) * 100,
];

/** 路線畫到 progress（0–1）時的折線與筆頭位置；長度用實際像素算，橫豎走起來一樣快 */
function partial(points: Point[], progress: number, width: number, height: number) {
  const px = points.map(([x, y]) => [(x * width) / 100, (y * height) / 100]);
  const lengths = px.slice(1).map(([x, y], i) => Math.hypot(x - px[i][0], y - px[i][1]));
  let remain = lengths.reduce((a, b) => a + b, 0) * progress;
  const out: Point[] = [points[0]];
  for (let i = 0; i < lengths.length; i++) {
    const [a, b] = [points[i], points[i + 1]];
    if (remain >= lengths[i]) {
      out.push(b);
      remain -= lengths[i];
      continue;
    }
    const t = lengths[i] ? remain / lengths[i] : 0;
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    break;
  }
  return out;
}

export function LadderBoard({
  ladder,
  names,
  labels,
  revealed,
  focus,
  hideResults,
  onPick,
  onTraced,
}: {
  ladder: Ladder;
  names: string[];
  labels: string[];
  /** 已經爬到底的人（名單索引） */
  revealed: number[];
  /** 目前畫出路線的人 */
  focus: number | null;
  hideResults: boolean;
  onPick: (player: number) => void;
  onTraced: (player: number) => void;
}) {
  const n = ladder.columns;
  const dense = n > DENSE;
  const board = useRef<HTMLDivElement>(null);
  const traced = useRef(onTraced);
  useEffect(() => {
    traced.current = onTraced;
  }, [onTraced]);

  const routes = useMemo(
    () => names.map((_, i) => trace(ladder, i)),
    [ladder, names],
  );
  const ownerOf = new Map(revealed.map((p) => [routes[p].end, p]));

  // 已經爬過的人再切回來直接畫完整路線；第一次爬才播動畫
  const [progress, setProgress] = useState(1);
  const alreadyRevealed = focus !== null && revealed.includes(focus);
  useEffect(() => {
    if (focus === null || alreadyRevealed) {
      setProgress(1);
      return;
    }
    const el = board.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduced) {
      setProgress(1);
      traced.current(focus);
      return;
    }
    const turns = routes[focus].points.length / 2;
    const duration = Math.min(3200, 900 + turns * 140);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(t);
      if (t < 1) frame = requestAnimationFrame(tick);
      else traced.current(focus);
    };
    setProgress(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // alreadyRevealed 只在換人的那一刻有意義；爬完加進 revealed 不該重播
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, routes]);

  const size = board.current?.getBoundingClientRect();
  const route =
    focus === null
      ? null
      : partial(
          routes[focus].points.map((p) => toView(ladder, p)),
          progress,
          size?.width ?? 100,
          size?.height ?? 100,
        );
  const head = route?.at(-1);
  const line = dense ? (n > 20 ? 1.5 : 2) : 4;

  const grid = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };

  return (
    <div className="flex w-full flex-col">
      <ol className="grid items-end gap-0.5" style={grid} aria-label="名單">
        {names.map((name, i) => (
          <li key={i} className="flex justify-center">
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-label={`爬 ${name} 的路線`}
              aria-pressed={focus === i}
              className={cn(
                "max-w-full truncate rounded-lg px-1 py-1 font-bold text-ink transition-[transform,background-color] duration-press ease-out hover:bg-accent active:scale-[0.97]",
                dense
                  ? "max-h-28 text-sm [text-orientation:upright] [writing-mode:vertical-rl]"
                  : "text-base sm:text-lg",
                focus === i && "bg-secondary",
              )}
              style={focus === i ? { color: colorOf(i) } : undefined}
            >
              {name}
            </button>
          </li>
        ))}
      </ol>

      <div ref={board} className="relative my-2 h-[min(46svh,26rem)] w-full text-ink">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          {Array.from({ length: n }, (_, c) => {
            const x = ((c + 0.5) / n) * 100;
            return (
              <line
                key={c}
                x1={x}
                x2={x}
                y1={0}
                y2={100}
                stroke="currentColor"
                strokeWidth={line}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {ladder.rows.flatMap((row, r) =>
            row.map((gap) => {
              const [x1, y] = toView(ladder, [gap, r + 1]);
              const [x2] = toView(ladder, [gap + 1, r + 1]);
              return (
                <line
                  key={`${r}-${gap}`}
                  x1={x1}
                  x2={x2}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={line}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              );
            }),
          )}
          {route && focus !== null && (
            <polyline
              points={route.map((p) => p.join(",")).join(" ")}
              fill="none"
              stroke={colorOf(focus)}
              strokeWidth={line * 2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {head && focus !== null && (
          <span
            className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow-sm"
            style={{ left: `${head[0]}%`, top: `${head[1]}%`, background: colorOf(focus) }}
            aria-hidden="true"
          />
        )}
      </div>

      <ol className="grid items-start gap-0.5" style={grid} aria-label="結果">
        {labels.map((label, c) => {
          const owner = ownerOf.get(c);
          const open = owner !== undefined || !hideResults;
          return (
            <li key={c} className="flex justify-center">
              <span
                className={cn(
                  "flex max-w-full items-center justify-center truncate rounded-lg border-2 px-1 py-1.5 font-bold transition-[background-color,border-color] duration-hover",
                  dense ? "max-h-32 min-h-12 w-full text-sm [text-orientation:upright] [writing-mode:vertical-rl]" : "min-w-12 text-base sm:text-lg",
                  owner !== undefined ? "bg-card text-ink" : "border-border bg-muted text-ink-soft",
                )}
                style={owner !== undefined ? { borderColor: colorOf(owner) } : undefined}
              >
                {open ? (dense ? label.replace(/\s/g, "") : label) : "？"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
