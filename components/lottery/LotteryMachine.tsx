"use client";

import { layout, traySlot, windEnvelope, type Layout } from "@/lib/lottery/game";
import { Bodies, Body, Composite, Engine, Events } from "matter-js";
import { useEffect, useRef } from "react";

/**
 * 乒乓球抽籤機。matter-js 管剛體（球互撞、彈牆、重力），這裡只加空氣：
 * 底部中央一個熱源往上吹成蘑菇雲、一陣一陣的，柱外回流下沉。
 * 球頂有一根管子，開蓋之後哪顆球被氣流推進管子就是哪顆──沒有亂數，純粹物理。
 * 抓到一顆蓋子就關上，球再用動畫飛到右側托盤，由上而下排。
 * 顏色全部從 CSS 變數讀，暗色主題自動跟上。
 */

const WALL = 80;
const WALL_SEGMENTS = 56;
const STEP_MS = 1000 / 60;
/** 乒乓球自由落下的終端速度（px/tick，1 tick = 1/60s）；越小越輕 */
const V_TERM = 4.2;
/** 熱源氣流（px/tick）：底部中央最強；柱外下沉 */
const PLUME = 28;
const SINK = 1.2;
/** 亂流強度 */
const TURB = 3;
const FLY_MS = 650;

interface Palette {
  paper: string;
  paperWarm: string;
  sand: string;
  stone: string;
  ink: string;
  balls: [string, string][];
}

interface Meta {
  label: string;
  /** 色票索引；換主題時靠它重取顏色 */
  ci: number;
  color: [string, string];
  seed: number;
}

interface Flying {
  meta: Meta;
  from: { x: number; y: number };
  to: { x: number; y: number };
  angle: number;
  at: number;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function readPalette(el: HTMLElement): Palette {
  const s = getComputedStyle(el);
  const v = (name: string) => s.getPropertyValue(name).trim();
  const paper = v("--paper");
  const ink = v("--ink");
  return {
    paper,
    paperWarm: v("--paper-warm"),
    sand: v("--sand"),
    stone: v("--stone"),
    ink,
    // 黃底用墨色字，其他三色用紙色字
    balls: [
      [v("--brand-red"), paper],
      [v("--brand-yellow"), ink],
      [v("--brand-blue"), paper],
      [v("--brand-green"), paper],
    ],
  };
}

/** 圓形牆拼成一圈；正上方開口那幾段就是蓋子，另外回傳好開關 */
function makeWalls(L: Layout) {
  const opt = { isStatic: true, friction: 0.02, restitution: 0.6 };
  const rr = L.r + WALL / 2;
  const len = (2 * Math.PI * rr) / WALL_SEGMENTS + 6;
  const ring: Body[] = [];
  const lid: Body[] = [];
  for (let i = 0; i < WALL_SEGMENTS; i++) {
    const a = (i / WALL_SEGMENTS) * Math.PI * 2;
    const seg = Bodies.rectangle(L.cx + rr * Math.cos(a), L.cy + rr * Math.sin(a), len, WALL, { ...opt, angle: a + Math.PI / 2 });
    // 正上方是 -π/2；落在開口半角內的段歸蓋子
    const d = Math.abs(((a + Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI);
    (d < L.gap ? lid : ring).push(seg);
  }
  const tubeH = L.tube.bottom - L.tube.top + 20;
  const tubeY = (L.tube.top + L.tube.bottom) / 2;
  ring.push(
    Bodies.rectangle(L.tube.x - WALL / 2, tubeY, WALL, tubeH, opt),
    Bodies.rectangle(L.tube.x + L.tube.w + WALL / 2, tubeY, WALL, tubeH, opt),
  );
  return { ring, lid };
}

function makeBall(x: number, y: number, r: number) {
  return Bodies.circle(x, y, r, {
    density: 0.001,
    frictionAir: 0.004,
    friction: 0.02,
    restitution: 0.62, // 乒乓球該有的彈
  });
}

/** 空氣對球的力：熱源氣流（蘑菇雲）加上球體阻力 */
function airForce(b: Body, m: Meta, time: number, L: Layout, weight: number, open: boolean) {
  const depth = clamp01((b.position.y - (L.cy - L.r)) / (2 * L.r)); // 0 頂 1 底
  const xr = (b.position.x - L.cx) / (2 * L.r); // -0.5 … 0.5
  const sigma = 0.2 + 0.12 * (1 - depth);
  const column = Math.exp(-(xr * xr) / (2 * sigma * sigma));
  const gust = 0.75 + 0.5 * Math.sin(time * 2.2 + b.position.y * 0.012 + m.seed);
  const core = PLUME * windEnvelope(time, open) * (0.32 + 0.68 * depth ** 1.3);
  const { x: px, y: py } = b.position;
  const swirlX =
    TURB * Math.sin(py * 0.021 + time * 1.7 + m.seed) * Math.cos(px * 0.017 - time * 1.1) +
    TURB * 0.5 * Math.sin(time * 3.7 + m.seed * 2);
  const swirlY = TURB * Math.cos(px * 0.019 + time * 1.3 + m.seed * 1.3) * Math.sin(py * 0.023 + time * 0.9);
  let up = -SINK + (core + SINK) * column * gust - swirlY;
  const outward = Math.sign(xr) * 6 * column * (1 - depth) ** 2;
  const inward = -xr * 18 * depth * depth * (1 - column);
  let side = inward + outward + swirlX;
  // 管口有吸力：開蓋時吸入區是往下張開的漏斗，靠近的球會被拉向管口；進了管子就不會掉回來
  const below = py - L.tube.bottom;
  const reach = open ? L.ballR * 5 : L.ballR;
  const halfW = L.tube.w / 2 + (open ? Math.max(0, below) * 0.8 : 0);
  if (Math.abs(px - L.cx) < halfW && below < reach) {
    up = PLUME * 0.9;
    if (open && below > 0) side = -(px - L.cx) * 0.25;
  }

  // 相對氣流；球的阻力二次律，自由落下時在 V_TERM 平衡
  const rx = b.velocity.x - side;
  const ry = b.velocity.y + up;
  const k = weight / (V_TERM * V_TERM);
  return { x: -k * rx * Math.abs(rx), y: -k * ry * Math.abs(ry) };
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number, m: Meta) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = "rgba(0,0,0,.18)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = m.color[0];
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, "rgba(255,255,255,.55)");
  g.addColorStop(0.5, "rgba(255,255,255,.05)");
  g.addColorStop(1, "rgba(0,0,0,.18)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.rotate(angle);
  ctx.fillStyle = m.color[1];
  ctx.font = `700 ${Math.round(r * 0.62)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(m.label, 0, 1, r * 1.7);
  ctx.restore();
}

const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/** 機身：底座、球體內壁、玻璃頸。畫在球的後面 */
function drawMachine(ctx: CanvasRenderingContext2D, L: Layout, P: Palette) {
  const { cx, cy, r, tube } = L;
  ctx.fillStyle = P.stone;
  rr(ctx, cx - r * 0.62, cy + r * 0.98, r * 1.24, r * 0.14, 10);
  ctx.fill();
  ctx.fillStyle = P.ink;
  rr(ctx, cx - r * 0.38, cy + r * 0.8, r * 0.76, r * 0.24, 10);
  ctx.fill();
  ctx.fillStyle = P.sand;
  rr(ctx, tube.x - 12, tube.top - 10, tube.w + 24, tube.bottom - tube.top + 34, 14);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.paper;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  const inner = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
  inner.addColorStop(0, "rgba(0,0,0,0)");
  inner.addColorStop(1, "rgba(0,0,0,.09)");
  ctx.fillStyle = inner;
  ctx.fill();
  ctx.fillStyle = P.paper;
  ctx.fillRect(tube.x, tube.top, tube.w, tube.bottom - tube.top + 12);
}

/** 遮黑：球體與頸子塗成墨色，玻璃反光照樣畫在上面，看起來像燻黑的玻璃 */
function drawBlackout(ctx: CanvasRenderingContext2D, L: Layout, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#141a20";
  ctx.beginPath();
  ctx.arc(L.cx, L.cy, L.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(L.tube.x, L.tube.top, L.tube.w, L.tube.bottom - L.tube.top + 12);
  ctx.restore();
}

/** 玻璃、邊框、托架、閘門。畫在球的前面 */
function drawGlass(ctx: CanvasRenderingContext2D, L: Layout, P: Palette, lidOpen: number) {
  const { cx, cy, r, tube } = L;
  const g = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.05, cx - r * 0.2, cy - r * 0.2, r * 0.9);
  g.addColorStop(0, "rgba(255,255,255,.55)");
  g.addColorStop(0.4, "rgba(255,255,255,.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.9, Math.PI * 0.12, Math.PI * 0.32);
  ctx.stroke();
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  ctx.stroke();
  // 托架：球底一圈深色抱住球
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();
  // 玻璃頸：邊框、領口
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(tube.x, tube.bottom + 4);
  ctx.lineTo(tube.x, tube.top);
  ctx.lineTo(tube.x + tube.w, tube.top);
  ctx.lineTo(tube.x + tube.w, tube.bottom + 4);
  ctx.stroke();
  ctx.fillStyle = P.ink;
  rr(ctx, tube.x - 10, tube.bottom - 12, tube.w + 20, 12, 5);
  ctx.fill();

  // 蓋子：黃色門板蓋在領口上，左端是鉸鏈，往上掀開靠到管壁
  const doorW = tube.w + 6;
  const doorY = tube.bottom - 8;
  const hingeX = tube.x - 3;
  ctx.save();
  ctx.translate(hingeX, doorY + 2);
  ctx.rotate(-lidOpen * 1.9);
  ctx.fillStyle = P.balls[1][0];
  rr(ctx, 0, -5, doorW, 10, 4);
  ctx.fill();
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 2;
  ctx.stroke();
  // 把手在遠離鉸鏈那端
  ctx.fillStyle = P.ink;
  ctx.beginPath();
  ctx.arc(doorW - 9, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 鉸鏈
  ctx.fillStyle = P.ink;
  ctx.beginPath();
  ctx.arc(hingeX, doorY + 2, 4, 0, Math.PI * 2);
  ctx.fill();
}

export function LotteryMachine({
  labels,
  blind = false,
  autoClose = true,
  onPick,
}: {
  /** 換一份新陣列就重新放滿 */
  labels: string[];
  /** 球體變黑，看不到裡面的球；物理照跑 */
  blind?: boolean;
  /** 抽到一顆就關蓋；false 則蓋子一直開著，再點一下才關 */
  autoClose?: boolean;
  /** 球飛到托盤之後呼叫 */
  onPick: (label: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onPickRef = useRef(onPick);
  const blindRef = useRef(blind);
  const autoCloseRef = useRef(autoClose);
  useEffect(() => {
    onPickRef.current = onPick;
    blindRef.current = blind;
    autoCloseRef.current = autoClose;
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0;
    let H = 0;
    let L = layout(1, 1, labels.length);
    let P = readPalette(canvas);
    let lidOpen = 0; // 畫的用
    let dark = 0; // 遮黑的淡入淡出
    let open = false; // 物理的用
    let flying: Flying | null = null;
    const tray: Meta[] = [];

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    const meta = new Map<number, Meta>();
    let walls: { ring: Body[]; lid: Body[] } = { ring: [], lid: [] };
    const balls = () => Composite.allBodies(engine.world).filter((b) => meta.has(b.id));

    const recolor = () => {
      P = readPalette(canvas);
      for (const m of [...meta.values(), ...tray]) m.color = P.balls[m.ci];
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      L = layout(W, H, labels.length);
      Composite.remove(engine.world, [...walls.ring, ...walls.lid]);
      walls = makeWalls(L);
      Composite.add(engine.world, open ? walls.ring : [...walls.ring, ...walls.lid]);
      // 視窗縮小時把跑到球外的拉回來
      balls().forEach((b) => {
        const dx = b.position.x - L.cx;
        const dy = b.position.y - L.cy;
        const d = Math.hypot(dx, dy);
        const max = L.r - L.ballR;
        if (d > max) Body.setPosition(b, { x: L.cx + (dx / d) * max, y: L.cy + (dy / d) * max });
      });
    };
    resize();
    labels.forEach((label, i) => {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * L.r * 0.6;
      const b = makeBall(L.cx + Math.cos(a) * d, L.cy + Math.sin(a) * d, L.ballR);
      const ci = i % P.balls.length;
      meta.set(b.id, { label, ci, color: P.balls[ci], seed: Math.random() * Math.PI * 2 });
      Composite.add(engine.world, b);
    });
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // 主題切換是改 <html> 的 class，跟著重讀顏色
    const mo = new MutationObserver(recolor);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    Events.on(engine, "beforeUpdate", () => {
      const time = engine.timing.timestamp / 1000;
      const g = engine.gravity.y * engine.gravity.scale;
      for (const b of balls()) {
        Body.applyForce(b, b.position, airForce(b, meta.get(b.id)!, time, L, b.mass * g, open));
      }
    });

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      acc = Math.min(acc + (now - last), STEP_MS * 3);
      last = now;
      while (acc >= STEP_MS) {
        Engine.update(engine, STEP_MS);
        acc -= STEP_MS;
      }
      lidOpen += ((open ? 1 : 0) - lidOpen) * 0.18;
      dark += ((blindRef.current ? 1 : 0) - dark) * 0.12;

      // 有球被推到管子頂端就算抓到：它離開物理世界；設定自動關蓋或球抽完了就把蓋子關上
      if (open && !flying) {
        const caught = balls().find((b) => b.position.y < L.tube.top + L.ballR * 1.3);
        if (caught) {
          const m = meta.get(caught.id)!;
          Composite.remove(engine.world, caught);
          meta.delete(caught.id);
          if (autoCloseRef.current || balls().length === 0) {
            open = false;
            Composite.add(engine.world, walls.lid);
          }
          flying = {
            meta: m,
            from: { x: caught.position.x, y: caught.position.y },
            to: traySlot(L, tray.length),
            angle: caught.angle,
            at: now,
          };
        }
      }

      ctx.clearRect(0, 0, W, H);
      drawMachine(ctx, L, P);
      for (const b of balls()) drawBall(ctx, b.position.x, b.position.y, L.ballR, b.angle, meta.get(b.id)!);
      if (dark > 0.005) drawBlackout(ctx, L, dark);
      drawGlass(ctx, L, P, lidOpen);
      tray.forEach((m, i) => {
        const { x, y } = traySlot(L, i);
        drawBall(ctx, x, y, L.ballR, 0, m);
      });

      if (flying) {
        const p = easeOut(Math.min(1, (now - flying.at) / FLY_MS));
        // 先往上拋再落到托盤，弧線比直線像被彈出來
        const x = flying.from.x + (flying.to.x - flying.from.x) * p;
        const y = flying.from.y + (flying.to.y - flying.from.y) * p - Math.sin(p * Math.PI) * 60;
        drawBall(ctx, x, y, L.ballR, flying.angle * (1 - p), flying.meta);
        if (p >= 1) {
          tray.push(flying.meta);
          onPickRef.current(flying.meta.label);
          flying = null;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onDown = () => {
      if (flying || balls().length === 0) return;
      if (open) {
        // 自動關蓋模式下開著就等球出來；持續打開模式再點一下是關蓋
        if (autoCloseRef.current) return;
        open = false;
        Composite.add(engine.world, walls.lid);
        return;
      }
      open = true;
      Composite.remove(engine.world, walls.lid);
    };
    canvas.addEventListener("pointerdown", onDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      Events.off(engine, "beforeUpdate");
      Engine.clear(engine);
    };
  }, [labels]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full cursor-pointer touch-manipulation"
      aria-label="抽籤機，點一下打開頂端的蓋子，看哪顆球被吹出來"
    />
  );
}
