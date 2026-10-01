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
export const colorOf = (player: number) =>
  PATH_COLORS[player % PATH_COLORS.length];

/** 線多的時候名字改直書、線條變細，30 條線才塞得進一個投影畫面 */
const DENSE = 10;
/** 超過 20 條線，直書字再小一級，一欄才放得下 */
const CROWDED = 20;
/** 一條線最少要的寬度；手機塞不下 30 條時改成左右捲動，不硬擠 */
const MIN_COLUMN_REM = 2.25;

type Point = [number, number];

/** 把 [直線, 高度] 換成 viewBox 0–100 的座標 */
const toView = (ladder: Ladder, [col, height]: Point): Point => [
  ((col + 0.5) / ladder.columns) * 100,
  (height / (ladder.rows.length + 1)) * 100,
];

/** 路線畫到 progress（0–1）時的折線與筆頭位置；長度用實際像素算，橫豎走起來一樣快 */
function partial(
  points: Point[],
  progress: number,
  width: number,
  height: number,
) {
  const px = points.map(([x, y]) => [(x * width) / 100, (y * height) / 100]);
  const lengths = px
    .slice(1)
    .map(([x, y], i) => Math.hypot(x - px[i][0], y - px[i][1]));
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
  started,
  hideResults,
  onPick,
  onTraced,
}: {
  ladder: Ladder;
  names: string[];
  labels: string[];
  /** 已經爬到底的人（名單索引） */
  revealed: number[];
  /** 目前看的人，路線畫粗一點、蓋在最上面 */
  focus: number | null;
  /** 已經出發的人；新加進來的開始爬，同一批一起到底，彼此不會打斷 */
  started: number[];
  hideResults: boolean;
  onPick: (player: number) => void;
  onTraced: (players: number[]) => void;
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

  // 每個人各自一段動畫：點了第二個人，第一個照樣爬完。同一批出發的（同時進行）共用時長，一起到底
  const climbs = useRef(new Map<number, { start: number; duration: number }>());
  const finished = useRef(new Set<number>());
  const looping = useRef(false);
  // 畫面讀這份快照，ref 只給動畫迴圈改
  const [frame, setFrame] = useState({
    now: 0,
    climbs: new Map<number, { start: number; duration: number }>(),
  });
  useEffect(() => {
    climbs.current.clear();
    finished.current.clear();
    setFrame({ now: 0, climbs: new Map() });
  }, [routes]);
  useEffect(() => {
    const fresh = started.filter(
      (p) =>
        !revealed.includes(p) &&
        !finished.current.has(p) &&
        !climbs.current.has(p),
    );
    if (!fresh.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fresh.forEach((p) => finished.current.add(p));
      traced.current(fresh);
      return;
    }
    const turns = Math.max(...fresh.map((p) => routes[p].points.length)) / 2;
    const duration = Math.min(3200, 900 + turns * 140);
    const start = performance.now();
    fresh.forEach((p) => climbs.current.set(p, { start, duration }));
    setFrame({ now: start, climbs: new Map(climbs.current) });
    if (looping.current) return;
    looping.current = true;
    const tick = (t: number) => {
      const arrived = [...climbs.current]
        .filter(([, c]) => t - c.start >= c.duration)
        .map(([p]) => p);
      arrived.forEach((p) => {
        climbs.current.delete(p);
        finished.current.add(p);
      });
      setFrame({ now: t, climbs: new Map(climbs.current) });
      if (arrived.length) traced.current(arrived);
      if (climbs.current.size) requestAnimationFrame(tick);
      else looping.current = false;
    };
    requestAnimationFrame(tick);
  }, [started, revealed, routes]);

  const size = board.current?.getBoundingClientRect();
  const progressOf = (player: number) => {
    const c = frame.climbs.get(player);
    return c ? Math.min(1, Math.max(0, (frame.now - c.start) / c.duration)) : 1;
  };
  const routeOf = (player: number) =>
    partial(
      routes[player].points.map((p) => toView(ladder, p)),
      progressOf(player),
      size?.width ?? 100,
      size?.height ?? 100,
    );
  const climbing = [...frame.climbs.keys()];
  // 爬過的線留著；看的那個人排最後，畫在最上面
  const drawn = [
    ...new Set([...revealed, ...climbing, ...(focus === null ? [] : [focus])]),
  ]
    .filter(
      (p) =>
        revealed.includes(p) || climbing.includes(p) || started.includes(p),
    )
    .sort((a, b) => Number(a === focus) - Number(b === focus))
    .map((player) => ({ player, route: routeOf(player) }));
  const heads = drawn.filter(
    ({ player }) => player === focus || climbing.includes(player),
  );
  const line = dense ? (n > CROWDED ? 2 : 2.5) : 4;
  const vertical = "[text-orientation:upright] [writing-mode:vertical-rl]";
  const denseText = n > CROWDED ? "text-lg sm:text-xl" : "text-xl sm:text-2xl";
  // 手機一欄太窄，超過 4 人就先改直書，名字與結果才不會被截掉
  const narrowVertical =
    n > 4 &&
    "max-sm:min-w-0 max-sm:text-xl max-sm:[text-orientation:upright] max-sm:[writing-mode:vertical-rl]";

  const grid = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };

  return (
    // 全螢幕時整塊吃滿舞台高度，格子本體拿剩下的；一般模式格子隨視窗高度伸縮
    <div className="w-full overflow-x-auto [#game-stage:fullscreen_&]:h-full">
      <div
        className="flex flex-col [#game-stage:fullscreen_&]:h-full"
        style={{ minWidth: `${n * MIN_COLUMN_REM}rem` }}
      >
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
                    ? cn("max-h-48", denseText, vertical)
                    : cn("text-2xl sm:text-3xl lg:text-4xl", narrowVertical),
                  focus === i && "bg-secondary",
                )}
                style={focus === i ? { color: colorOf(i) } : undefined}
              >
                {name}
              </button>
            </li>
          ))}
        </ol>

        <div
          ref={board}
          className={cn(
            "relative my-3 w-full text-ink [#game-stage:fullscreen_&]:h-auto [#game-stage:fullscreen_&]:min-h-0 [#game-stage:fullscreen_&]:flex-1",
            // 扣掉頂列、名字、結果與上方揭曉字；直書時兩排比較高
            dense
              ? "h-[clamp(16rem,calc(100svh-30rem),40rem)]"
              : "h-[clamp(18rem,calc(100svh-24rem),44rem)]",
          )}
        >
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
            {drawn.map(({ player, route }) => (
              <polyline
                key={player}
                data-route={player}
                points={route.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke={colorOf(player)}
                strokeWidth={line * (player === focus ? 2.4 : 1.6)}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          {heads.map(({ player, route }) => {
            const [x, y] = route.at(-1)!;
            return (
              <span
                key={player}
                className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow-sm"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  background: colorOf(player),
                }}
                aria-hidden="true"
              />
            );
          })}
        </div>

        <ol className="grid items-start gap-0.5" style={grid} aria-label="結果">
          {labels.map((label, c) => {
            const owner = ownerOf.get(c);
            const open = owner !== undefined || !hideResults;
            return (
              <li key={c} className="flex justify-center">
                {/* 揭曉後的結果可以點，點了就換看那個人的路線 */}
                <button
                  type="button"
                  disabled={owner === undefined}
                  onClick={() => owner !== undefined && onPick(owner)}
                  aria-label={
                    owner !== undefined
                      ? `看 ${names[owner]} 的路線`
                      : undefined
                  }
                  aria-pressed={
                    owner !== undefined ? focus === owner : undefined
                  }
                  className={cn(
                    "flex max-w-full items-center justify-center truncate rounded-lg border-2 px-1 py-1.5 font-bold transition-[background-color,border-color,transform] duration-hover enabled:cursor-pointer enabled:hover:bg-accent enabled:active:scale-[0.97]",
                    owner !== undefined && focus === owner && "bg-secondary",
                    dense
                      ? cn("max-h-52 min-h-16 w-full", denseText, vertical)
                      : cn(
                          "min-w-16 px-2 text-2xl sm:text-3xl lg:text-4xl",
                          narrowVertical,
                        ),
                    owner !== undefined
                      ? "bg-card text-ink"
                      : "border-border bg-muted text-ink-soft",
                  )}
                  style={
                    owner !== undefined
                      ? { borderColor: colorOf(owner) }
                      : undefined
                  }
                >
                  {!open ? (
                    "？"
                  ) : dense ? (
                    label.replace(/\s/g, "")
                  ) : n > 4 ? (
                    // 手機直書時拿掉空白，「第 1 組」才不會拉得太長
                    <>
                      <span className="max-sm:hidden">{label}</span>
                      <span className="sm:hidden">
                        {label.replace(/\s/g, "")}
                      </span>
                    </>
                  ) : (
                    label
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
