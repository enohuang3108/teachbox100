"use client";

import { Bodies, Body, Composite, Engine, Query, type IBodyDefinition } from "matter-js";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { BoxDraw, type BoxDrawPhase } from "@/lib/lottery/box-draw";
import styles from "./LotteryMachine.module.css";
import { BRAND } from "@/lib/design-tokens";

const BALL_COLORS = [BRAND.yellow, BRAND.red, BRAND.blue, BRAND.green];
type BallRecord = { id: number; body: Body; color: string };
type VanishingBall = { x: number; y: number; r: number; color: string; startedAt: number };

function ballRadius(width: number, height: number, count: number) {
  return Math.max(24, Math.min(48, Math.sqrt((width * height * 0.46) / (Math.max(count, 1) * Math.PI))));
}

function drawBall(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, angle = 0, scale = 1) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.scale(scale, scale);
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.clip();
  context.fillStyle = "#fff";
  context.fillRect(-radius, -radius, radius * 2, radius);
  context.fillStyle = color;
  context.fillRect(-radius, 0, radius * 2, radius);
  const shade = context.createRadialGradient(-radius * 0.35, -radius * 0.4, radius * 0.05, 0, 0, radius * 1.1);
  shade.addColorStop(0, "rgba(255,255,255,.55)");
  shade.addColorStop(0.52, "rgba(255,255,255,0)");
  shade.addColorStop(1, "rgba(2,13,21,.18)");
  context.fillStyle = shade;
  context.fillRect(-radius, -radius, radius * 2, radius * 2);
  context.beginPath();
  context.moveTo(-radius, 0);
  context.lineTo(radius, 0);
  context.strokeStyle = "rgba(2,13,21,.14)";
  context.lineWidth = 1.5;
  context.stroke();
  context.restore();
  context.beginPath();
  context.arc(x, y, radius * scale, 0, Math.PI * 2);
  context.strokeStyle = BRAND.ink;
  context.lineWidth = Math.max(1.5, radius * 0.045);
  context.stroke();
}

function Reveal({ id, label, phase, onCancel, onOpen, onReturn, onNext }: {
  id: number; label: string; phase: BoxDrawPhase | "opening";
  onCancel: () => void; onOpen: () => void; onReturn: () => void; onNext: () => void;
}) {
  const ballStyle = { "--ball-color": BALL_COLORS[id % BALL_COLORS.length] } as CSSProperties;
  if (phase === "revealed") {
    return <dialog open className={styles.resultScreen} aria-label={`抽中：${label}`}>
      <div className={styles.resultContent}>
        <span className={styles.eyebrow}>抽籤結果</span>
        <div className={styles.chosenBall} style={ballStyle} aria-hidden="true"><span className={styles.question}>✓</span></div>
        <output className={styles.result} data-testid="lottery-result">{label}</output>
        <div className={styles.actions}>
          <button type="button" aria-label="放回去" className={`${styles.action} ${styles.cancel}`} onClick={onReturn}>放回去</button>
          <button type="button" aria-label="再抽一顆" className={`${styles.action} ${styles.primary}`} onClick={onNext}>再抽一顆</button>
        </div>
      </div>
    </dialog>;
  }
  return <dialog open className={styles.overlay} aria-label="準備打開抽中的球">
    {phase === "opening" && <div className={styles.flash} aria-hidden="true" />}
    {phase === "selected" && <div className={styles.dialog}>
      <div className={styles.chosenBall} style={ballStyle}>
        <span className={styles.question} aria-hidden="true">?</span><span className="sr-only">尚未揭曉的球</span>
      </div>
      <div className={styles.actions}>
        <button type="button" aria-label="取消" className={`${styles.action} ${styles.cancel}`} onClick={onCancel}>取消</button>
        <button type="button" aria-label="打開" className={`${styles.action} ${styles.primary}`} onClick={onOpen} autoFocus>打開</button>
      </div>
    </div>}
  </dialog>;
}

export function LotteryMachine({ labels, onPick }: { labels: string[]; onPick: (label: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const machineRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Engine.create({ gravity: { x: 0, y: 1.05 } }));
  const ballsRef = useRef<BallRecord[]>([]);
  const wallsRef = useRef<Body[]>([]);
  const vanishRef = useRef<VanishingBall | null>(null);
  const draw = useMemo(() => new BoxDraw(labels.length), [labels]);
  const [phase, setPhase] = useState<BoxDrawPhase | "opening">(draw.phase);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const addBall = useCallback((id: number, x?: number, y?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    const radius = ballRadius(width, height, labels.length);
    const options: IBodyDefinition = { restitution: 0.56, friction: 0.055, frictionAir: 0.008, density: 0.002 };
    const body = Bodies.circle(x ?? width / 2 + (id % 3 - 1) * radius * 1.15, y ?? 48 + radius, radius, options);
    Body.setAngularVelocity(body, (id % 2 ? -1 : 1) * 0.025);
    Composite.add(engineRef.current.world, body);
    ballsRef.current.push({ id, body, color: BALL_COLORS[id % BALL_COLORS.length] });
  }, [labels.length]);

  useEffect(() => {
    const canvas = canvasRef.current, machine = machineRef.current;
    if (!canvas || !machine) return;
    const engine = engineRef.current;
    let animationFrame = 0, lastTime = performance.now(), width = 0, height = 0;
    const resize = () => {
      const rect = machine.getBoundingClientRect();
      width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      Composite.remove(engine.world, wallsRef.current);
      const thickness = 80;
      wallsRef.current = [
        Bodies.rectangle(-thickness / 2 + 12, height / 2, thickness, height * 2, { isStatic: true }),
        Bodies.rectangle(width + thickness / 2 - 12, height / 2, thickness, height * 2, { isStatic: true }),
        Bodies.rectangle(width / 2, height + thickness / 2 - 12, width * 2, thickness, { isStatic: true }),
        Bodies.rectangle(width / 2, -thickness / 2, width * 2, thickness, { isStatic: true }),
      ];
      Composite.add(engine.world, wallsRef.current);
      for (const { body } of ballsRef.current) {
        const radius = body.circleRadius ?? 24;
        Body.setPosition(body, { x: Math.max(radius, Math.min(width - radius, body.position.x)), y: Math.min(height - radius, body.position.y) });
      }
    };
    resize();
    labels.forEach((_, id) => addBall(id, width * (0.2 + ((id * 0.61803398875) % 1) * 0.6), 45 + (id % 5) * 7));
    const observer = new ResizeObserver(resize); observer.observe(machine);
    const render = (now: number) => {
      Engine.update(engine, Math.min(1000 / 60, now - lastTime)); lastTime = now;
      const dpr = Math.min(window.devicePixelRatio || 1, 2), context = canvas.getContext("2d")!;
      context.setTransform(dpr, 0, 0, dpr, 0, 0); context.clearRect(0, 0, width, height);
      for (const ball of ballsRef.current) drawBall(context, ball.body.position.x, ball.body.position.y, ball.body.circleRadius ?? 24, ball.color);
      const vanishing = vanishRef.current;
      if (vanishing) {
        const progress = Math.min(1, (now - vanishing.startedAt) / 200);
        drawBall(context, vanishing.x, vanishing.y, vanishing.r, vanishing.color, 0, 1 - progress * progress);
        if (progress >= 1) vanishRef.current = null;
      }
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animationFrame); observer.disconnect(); Composite.clear(engine.world, false); Engine.clear(engine); ballsRef.current = []; wallsRef.current = []; };
  }, [addBall, labels]);

  const choose = (id: number) => {
    if (!draw.select(id)) return;
    const record = ballsRef.current.find((ball) => ball.id === id);
    if (!record) return;
    vanishRef.current = { x: record.body.position.x, y: record.body.position.y, r: record.body.circleRadius ?? 24, color: record.color, startedAt: performance.now() };
    Composite.remove(engineRef.current.world, record.body);
    ballsRef.current = ballsRef.current.filter((ball) => ball.id !== id);
    setSelectedId(id); window.setTimeout(() => setPhase("selected"), 200);
  };
  const putBack = () => {
    if (selectedId === null) return;
    draw.restore(selectedId); addBall(selectedId); setSelectedId(null); setPhase(draw.phase);
  };
  const open = () => {
    if (draw.open() === null) return;
    setPhase("opening");
    window.setTimeout(() => setPhase("revealed"), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 620);
  };
  const next = () => {
    const id = draw.confirm();
    if (id === null) return;
    onPick(labels[id]); setSelectedId(null); setPhase(draw.phase);
  };

  return <>
    <div ref={machineRef} className={styles.machine}>
      <button type="button" className={styles.canvasHit} disabled={phase !== "ready"} aria-label="扭蛋機，點一顆扭蛋或按 Enter 開始抽籤"
        onPointerMove={(event) => {
          if (phase !== "ready") return;
          const rect = event.currentTarget.getBoundingClientRect();
          const hit = Query.point(ballsRef.current.map((ball) => ball.body), { x: event.clientX - rect.left, y: event.clientY - rect.top });
          event.currentTarget.style.cursor = hit.length ? "pointer" : "default";
        }}
        onPointerDown={(event) => {
          if (phase !== "ready" || !event.isPrimary) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const hit = Query.point(ballsRef.current.map((ball) => ball.body), { x: event.clientX - rect.left, y: event.clientY - rect.top })[0];
          const record = ballsRef.current.find((ball) => ball.body === hit);
          if (record) choose(record.id);
        }}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && phase === "ready") {
            event.preventDefault();
            const id = draw.remainingIds[0];
            if (id !== undefined) choose(id);
          }
        }}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      </button>
      <div className="sr-only" aria-label="可抽的球">
        {draw.remainingIds.map((id) => <button key={id} type="button" onClick={() => choose(id)}>抽第 {id + 1} 顆球</button>)}
      </div>
    </div>
    {typeof document !== "undefined" && selectedId !== null && ["selected", "opening", "revealed"].includes(phase) && createPortal(
      <Reveal id={selectedId} label={labels[selectedId]} phase={phase} onCancel={putBack} onOpen={open} onReturn={putBack} onNext={next} />, document.fullscreenElement ?? document.body,
    )}
  </>;
}
