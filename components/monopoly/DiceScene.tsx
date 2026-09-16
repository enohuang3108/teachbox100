"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { orientDie, sampleDie } from "@/lib/monopoly/dice";

// 錄好的動作是 156 格 @60fps（2.6 秒）；2.6 倍剛好 1 秒落定。太快會看不出翻滾就調低
const PLAYBACK_SPEED = 2.6;

type Motion ={ fps: number; tracks: number[][][] };
// 模組層快取：設定頁的 preloadMonopoly 先呼叫，第一次擲骰就不用再抓與解析
let assets: Promise<[THREE.Group, Motion]> | undefined;
export function loadAssets() {
  return assets ??= Promise.all([
    new GLTFLoader().loadAsync("/3d_model/monopoly-die.glb").then(g => g.scene),
    fetch("/3d_model/monopoly-dice-motion.json").then(r => {
      if (!r.ok) throw new Error("Dice motion unavailable");
      return r.json() as Promise<Motion>;
    }),
  ]).catch(error => { assets = undefined; throw error; });
}

// still：直接擺在落地姿勢、不播翻滾，給還沒擲過時的待機畫面用
export default function DiceScene({ values, onComplete, still = false }: { values: number[]; onComplete?: () => void; still?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const complete = useRef(onComplete);
  useEffect(() => { complete.current = onComplete; }, [onComplete]);
  const [failed, setFailed] = useState(false);
  const [settled, setSettled] = useState(false);
  const key = values.join(",");

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let observer: ResizeObserver | undefined;
    let ground: THREE.Mesh | undefined;
    let finished = false;
    const finish = () => {
      if (finished || disposed) return;
      finished = true; setSettled(true); complete.current?.();
    };
    setFailed(false); setSettled(false);
    loadAssets().then(([model, motion]) => {
      if (disposed) return;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0, 0);
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 100);
      const centerX = key.includes(",") ? .4 : -1.8;
      camera.position.set(centerX, 13, 10); camera.lookAt(centerX, 1.3, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x74664f, 3));
      const light = new THREE.DirectionalLight(0xfff2dc, 4);
      light.position.set(-3, 10, 5); light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      Object.assign(light.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
      light.shadow.normalBias = .025; scene.add(light);
      ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: .22 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -.008; ground.receiveShadow = true; scene.add(ground);
      const dice = key.split(",").map((value, i) => {
        const track = motion.tracks[i % 2];
        const landing = new THREE.Quaternion().fromArray(track[track.length - 1], 3);
        const mesh = model.clone(true);
        mesh.quaternion.copy(orientDie(Number(value), landing));
        mesh.traverse(object => { if (object instanceof THREE.Mesh) object.castShadow = true; });
        const pivot = new THREE.Group(); pivot.add(mesh); scene.add(pivot);
        return { pivot, track };
      });
      const resize = () => {
        if (!renderer) return;
        const width = container.clientWidth, height = container.clientHeight;
        renderer.setSize(width, height);
        const aspect = width / Math.max(height, 1);
        const span = Math.max(4.8, (key.includes(",") ? 9.4 : 5.8) / aspect);
        camera.left = -span * aspect / 2; camera.right = span * aspect / 2;
        camera.top = span / 2; camera.bottom = -span / 2;
        camera.updateProjectionMatrix(); renderer.render(scene, camera);
      };
      observer = new ResizeObserver(resize); observer.observe(container); resize();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      const animate = (now: number) => {
        if (disposed || !renderer) return;
        const tick = reduced || still ? motion.tracks[0].length - 1 : (now - start) / 1000 * motion.fps * PLAYBACK_SPEED;
        for (const { pivot, track } of dice) {
          const pose = sampleDie(track, tick);
          pivot.position.copy(pose.position);
          pivot.quaternion.copy(pose.rotation);
        }
        renderer.render(scene, camera);
        if (tick >= motion.tracks[0].length - 1) finish();
        else frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }).catch(() => { if (!disposed) { setFailed(true); finish(); } });
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer?.disconnect();
      renderer?.dispose(); renderer?.domElement.remove();
      ground?.geometry.dispose();
      if (ground?.material instanceof THREE.Material) ground.material.dispose();
    };
  }, [key, still]);

  return <div className="relative h-64 w-full" role="img" aria-label={settled ? `擲出 ${values.join("、")} 點` : "骰子拋起、落地翻滾中"}>
    <div ref={host} className="h-full w-full" aria-hidden="true" />
    {failed && <div className="absolute inset-0 flex items-center justify-center gap-5 text-5xl" aria-hidden="true">{values.map((v, i) => <span key={i}>{["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][v - 1]}</span>)}</div>}
  </div>;
}
