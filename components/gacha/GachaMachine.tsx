"use client";

import { BoxDraw } from "@/lib/gacha/box-draw";
import { BRAND } from "@/lib/design-tokens";
import { Bodies, Body, Composite, Engine } from "matter-js";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import styles from "./GachaMachine.module.css";

const BALL_COLORS = [BRAND.yellow, BRAND.red, BRAND.blue, BRAND.green];
/** 位移超過這麼多 px 或按住超過這麼久，就算拖曳不算點 */
const TAP_SLOP = 8;
const TAP_MS = 350;
const FLY_MS = 380;

type Ball = {
  id: number;
  body: Body;
  mesh: THREE.Group;
  seed: number;
  /** 還在從箱外飛進來：先穿過牆，整顆進到箱內才開始會撞牆 */
  entering: boolean;
  thrownAt: number;
};

// 碰撞分組：飛進來途中的球只跟球撞、不跟牆撞
const BALL = 0x0001;
const WALL = 0x0002;
const THROW_STAGGER_MS = 70;
type Phase = "ready" | "flying" | "opening" | "revealed";

/** 球越多越小；投影在教室要夠大，所以下限拉高 */
function ballRadius(width: number, height: number, count: number) {
  return Math.max(
    36,
    Math.min(
      96,
      Math.sqrt((width * height * 0.3) / (Math.max(count, 1) * Math.PI)),
    ),
  );
}

/** 上半白、下半彩色、中間一圈接縫的扭蛋殼，半徑 1，外面用 scale 放大 */
function capsuleMesh(
  color: string,
  shared: { top: THREE.Material; seam: THREE.Material },
) {
  const group = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
    shared.top,
  );
  const bottom = new THREE.Mesh(
    new THREE.SphereGeometry(
      1,
      40,
      20,
      0,
      Math.PI * 2,
      Math.PI / 2,
      Math.PI / 2,
    ),
    new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.02 }),
  );
  // 只有下半殼的材質是這顆自己的，其他共用，收掉時別一起丟
  bottom.userData.ownMaterial = true;
  const seam = new THREE.Mesh(
    new THREE.TorusGeometry(1.002, 0.035, 10, 64),
    shared.seam,
  );
  seam.rotation.x = Math.PI / 2;
  group.add(top, bottom, seam);
  return group;
}

function disposeGroup(group: THREE.Group) {
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      if (o.userData.ownMaterial) (o.material as THREE.Material).dispose();
    }
  });
}

function Result({
  id,
  label,
  putBack,
  onContinue,
}: {
  id: number;
  label: string;
  putBack: boolean;
  onContinue: () => void;
}) {
  const ballStyle = {
    "--ball-color": BALL_COLORS[id % BALL_COLORS.length],
  } as CSSProperties;
  return (
    <dialog open className={styles.resultScreen} aria-label={`抽中：${label}`}>
      <div className={styles.resultContent}>
        <div
          className={styles.chosenBall}
          style={ballStyle}
          aria-hidden="true"
        />
        <output className={styles.result} data-testid="gacha-result">
          {label}
        </output>
        <button
          type="button"
          className={`${styles.action} ${styles.primary}`}
          onClick={onContinue}
          autoFocus
        >
          {putBack ? "放回箱子，繼續抽" : "繼續抽"}
        </button>
      </div>
    </dialog>
  );
}

/**
 * 滿版的扭蛋箱：matter-js 管碰撞（零重力、慢慢漂），three.js 把球畫成立體扭蛋。
 * 按住拖曳可以撥動扭蛋；輕點一顆就直接飛到中間打開，不另外問。
 */
export function GachaMachine({
  labels,
  putBack,
  onPick,
}: {
  labels: string[];
  putBack: boolean;
  onPick: (label: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const engineRef = useRef<Engine | null>(null);
  const flyRef = useRef<{
    ball: Ball;
    from: THREE.Vector3;
    fromScale: number;
    start: number;
  } | null>(null);
  const draw = useMemo(() => new BoxDraw(labels.length), [labels]);
  const [phase, setPhase] = useState<Phase>("ready");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(draw.remainingIds);
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  // 事件處理在 effect 裡綁一次，拿最新的開啟函式
  const openRef = useRef<(id: number) => void>(() => {});
  const addRef = useRef<(id: number) => void>(() => {});

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let width = Math.max(1, host.clientWidth);
    let height = Math.max(1, host.clientHeight);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // 1 單位 = 1 px，y 往下為正（跟 matter-js 同一套座標，畫的時候取負）
    const camera = new THREE.OrthographicCamera(
      0,
      width,
      0,
      -height,
      -2000,
      2000,
    );
    camera.position.z = 1000;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9cfbf, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(-0.6, 0.9, 1);
    scene.add(sun);
    const shared = {
      top: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.28,
        metalness: 0.02,
      }),
      seam: new THREE.MeshStandardMaterial({
        color: BRAND.ink,
        roughness: 0.6,
      }),
    };

    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    engineRef.current = engine;
    let walls: Body[] = [];
    const buildWalls = () => {
      Composite.remove(engine.world, walls);
      const t = 200;
      walls = [
        Bodies.rectangle(-t / 2, height / 2, t, height * 3, {
          isStatic: true,
          collisionFilter: { category: WALL },
        }),
        Bodies.rectangle(width + t / 2, height / 2, t, height * 3, {
          isStatic: true,
          collisionFilter: { category: WALL },
        }),
        Bodies.rectangle(width / 2, -t / 2, width * 3, t, {
          isStatic: true,
          collisionFilter: { category: WALL },
        }),
        Bodies.rectangle(width / 2, height + t / 2, width * 3, t, {
          isStatic: true,
          collisionFilter: { category: WALL },
        }),
      ];
      Composite.add(engine.world, walls);
    };
    buildWalls();

    const radius = () => ballRadius(width, height, labels.length);
    /** 從四邊隨機一邊的箱外出發，瞄準中間一帶的隨機點 */
    const throwFrom = (r: number) => {
      const side = Math.floor(Math.random() * 4);
      const along = Math.random();
      const x =
        side === 1 ? width + r * 1.5 : side === 3 ? -r * 1.5 : along * width;
      const y =
        side === 2 ? height + r * 1.5 : side === 0 ? -r * 1.5 : along * height;
      const tx = width * (0.25 + Math.random() * 0.5);
      const ty = height * (0.25 + Math.random() * 0.5);
      const d = Math.hypot(tx - x, ty - y) || 1;
      const speed = 16 + Math.random() * 8;
      return {
        x,
        y,
        v: { x: ((tx - x) / d) * speed, y: ((ty - y) / d) * speed },
      };
    };
    const addBall = (id: number, x?: number, y?: number, throwIn = false) => {
      const r = radius();
      let px = x ?? r + Math.random() * (width - 2 * r);
      let py = y ?? r + Math.random() * (height - 2 * r);
      let v = { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 };
      if (throwIn) ({ x: px, y: py, v } = throwFrom(r));
      const body = Bodies.circle(px, py, r, {
        restitution: 0.92,
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0.012,
        density: 0.001,
        collisionFilter: { category: BALL, mask: throwIn ? BALL : BALL | WALL },
      });
      if (!reduced) Body.setVelocity(body, v);
      Composite.add(engine.world, body);
      const mesh = capsuleMesh(BALL_COLORS[id % BALL_COLORS.length], shared);
      mesh.scale.setScalar(r);
      scene.add(mesh);
      mesh.position.set(px, -py, 0);
      ballsRef.current.push({
        id,
        body,
        mesh,
        seed: Math.random() * 1000,
        entering: throwIn,
        thrownAt: performance.now(),
      });
    };
    addRef.current = (id) => addBall(id, width / 2, height / 2);
    // 開場從四面八方丟進來；減少動態時直接擺在箱子裡
    const throwTimers = draw.remainingIds.map((id, i) =>
      reduced
        ? (addBall(id), 0)
        : window.setTimeout(
            () => addBall(id, undefined, undefined, true),
            i * THROW_STAGGER_MS,
          ),
    );

    const observer = new ResizeObserver(() => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height);
      camera.right = width;
      camera.bottom = -height;
      camera.updateProjectionMatrix();
      buildWalls();
      for (const { body } of ballsRef.current) {
        const r = body.circleRadius ?? 40;
        Body.setPosition(body, {
          x: Math.min(width - r, Math.max(r, body.position.x)),
          y: Math.min(height - r, Math.max(r, body.position.y)),
        });
      }
    });
    observer.observe(host);

    // 拖曳：按到的球跟著手指走（用速度追，碰到別顆會推開）；沒怎麼動就放開算點一下
    let drag: {
      ball: Ball;
      x: number;
      y: number;
      sx: number;
      sy: number;
      t: number;
      moved: boolean;
    } | null = null;
    const local = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const hit = (x: number, y: number) =>
      [...ballsRef.current]
        .reverse()
        .find(
          ({ body }) =>
            Math.hypot(body.position.x - x, body.position.y - y) <=
            (body.circleRadius ?? 0),
        );
    const onDown = (e: PointerEvent) => {
      if (phaseRef.current !== "ready" || !e.isPrimary) return;
      const p = local(e);
      const ball = hit(p.x, p.y);
      if (!ball) return;
      renderer.domElement.setPointerCapture(e.pointerId);
      drag = {
        ball,
        x: p.x,
        y: p.y,
        sx: p.x,
        sy: p.y,
        t: performance.now(),
        moved: false,
      };
      renderer.domElement.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (drag) {
        drag.x = p.x;
        drag.y = p.y;
        if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > TAP_SLOP)
          drag.moved = true;
      } else if (phaseRef.current === "ready") {
        renderer.domElement.style.cursor = hit(p.x, p.y) ? "grab" : "default";
      }
    };
    const onUp = () => {
      if (!drag) return;
      const { ball, moved, t } = drag;
      drag = null;
      renderer.domElement.style.cursor = "default";
      if (!moved && performance.now() - t < TAP_MS) openRef.current(ball.id);
    };
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(1000 / 30, now - last);
      last = now;
      for (const ball of ballsRef.current) {
        const { body, seed } = ball;
        if (ball.entering) {
          const r = body.circleRadius ?? 0;
          const { x, y } = body.position;
          const inside = x >= r && x <= width - r && y >= r && y <= height - r;
          const offscreen = x < -r || x > width + r || y < -r || y > height + r;
          if (inside) {
            ball.entering = false;
            body.collisionFilter.mask = BALL | WALL;
          } else if (offscreen && now - ball.thrownAt > 600) {
            // 被撞回去或沒飛進來：它已經在畫面外，換個方向再丟一次，看不到瞬移
            const again = throwFrom(r);
            Body.setPosition(body, { x: again.x, y: again.y });
            Body.setVelocity(body, again.v);
            ball.thrownAt = now;
          }
        }
        if (drag?.ball === ball) {
          Body.setVelocity(body, {
            x: (drag.x - body.position.x) * 0.35,
            y: (drag.y - body.position.y) * 0.35,
          });
        } else if (!reduced && !ball.entering) {
          // 各自一股慢慢換方向的氣流：漂著、不會全部擠到同一邊
          const k = 0.0000009 * body.mass;
          Body.applyForce(body, body.position, {
            x: Math.sin(now * 0.00041 + seed) * k,
            y: Math.cos(now * 0.00033 + seed * 1.7) * k,
          });
        }
        const speed = Math.hypot(body.velocity.x, body.velocity.y);
        if (speed > 28)
          Body.setVelocity(body, {
            x: (body.velocity.x / speed) * 28,
            y: (body.velocity.y / speed) * 28,
          });
      }
      Engine.update(engine, dt);

      for (const { body, mesh, seed } of ballsRef.current) {
        mesh.position.set(body.position.x, -body.position.y, 0);
        const r = body.circleRadius ?? 40;
        // 滾動感：往哪走就往哪翻
        mesh.rotation.x += (body.velocity.y / r) * 0.9;
        mesh.rotation.y += (body.velocity.x / r) * 0.9;
        mesh.rotation.z = reduced ? 0 : Math.sin(now * 0.0003 + seed) * 0.3;
      }

      const fly = flyRef.current;
      if (fly) {
        const p = Math.min(1, (now - fly.start) / FLY_MS);
        const e = 1 - Math.pow(1 - p, 3);
        const target = new THREE.Vector3(width / 2, -height / 2, 400);
        fly.ball.mesh.position.lerpVectors(fly.from, target, e);
        fly.ball.mesh.scale.setScalar(
          fly.fromScale + (Math.min(width, height) * 0.22 - fly.fromScale) * e,
        );
        fly.ball.mesh.rotation.x *= 1 - e * 0.2;
        fly.ball.mesh.rotation.y *= 1 - e * 0.2;
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      throwTimers.forEach((t) => window.clearTimeout(t));
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      for (const ball of ballsRef.current) disposeGroup(ball.mesh);
      if (flyRef.current) disposeGroup(flyRef.current.ball.mesh);
      ballsRef.current = [];
      flyRef.current = null;
      shared.top.dispose();
      shared.seam.dispose();
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      renderer.dispose();
      canvas.remove();
    };
  }, [draw, labels]);

  openRef.current = (id: number) => {
    const engine = engineRef.current;
    const ball = ballsRef.current.find((b) => b.id === id);
    if (!engine || !ball || !draw.select(id) || draw.open() === null) return;
    // 飛出去的球先離開物理世界，揭曉後依設定放回或收走
    Composite.remove(engine.world, ball.body);
    ballsRef.current = ballsRef.current.filter((b) => b !== ball);
    flyRef.current = {
      ball,
      from: ball.mesh.position.clone(),
      fromScale: ball.mesh.scale.x,
      start: performance.now(),
    };
    setSelectedId(id);
    setPhase("flying");
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.setTimeout(() => setPhase("opening"), reduced ? 0 : FLY_MS);
    window.setTimeout(() => setPhase("revealed"), reduced ? 80 : FLY_MS + 620);
  };

  const onContinue = () => {
    if (selectedId === null) return;
    const fly = flyRef.current;
    if (fly) {
      fly.ball.mesh.parent?.remove(fly.ball.mesh);
      disposeGroup(fly.ball.mesh);
      flyRef.current = null;
    }
    onPick(labels[selectedId]);
    if (putBack) {
      draw.restore(selectedId);
      addRef.current(selectedId);
    } else {
      draw.confirm();
    }
    setRemaining(draw.remainingIds);
    setSelectedId(null);
    setPhase("ready");
  };

  const pickRandom = () => {
    const id = remaining[Math.floor(Math.random() * remaining.length)];
    if (id !== undefined && phase === "ready") openRef.current(id);
  };

  return (
    <>
      <div
        ref={hostRef}
        role="button"
        tabIndex={0}
        aria-label="扭蛋機，點一顆扭蛋或按 Enter 開始抽籤"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pickRandom();
          }
        }}
        className="h-full w-full outline-none focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:ring-inset"
      />
      <div className="sr-only" aria-label="可抽的扭蛋">
        {remaining.map((id) => (
          <button key={id} type="button" onClick={() => openRef.current(id)}>
            抽第 {id + 1} 顆扭蛋
          </button>
        ))}
      </div>
      {typeof document !== "undefined" &&
        selectedId !== null &&
        (phase === "opening" || phase === "revealed") &&
        createPortal(
          phase === "opening" ? (
            <div className={styles.overlay} aria-hidden="true">
              <div className={styles.flash} />
            </div>
          ) : (
            <Result
              id={selectedId}
              label={labels[selectedId]}
              putBack={putBack}
              onContinue={onContinue}
            />
          ),
          document.fullscreenElement ?? document.body,
        )}
    </>
  );
}
