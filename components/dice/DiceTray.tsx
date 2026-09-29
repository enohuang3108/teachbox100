"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { BRAND } from "@/lib/design-tokens";
import type { DiceMode } from "@/lib/dice/game";
import { DIE_NORMALS, orientDie, sampleDie } from "@/lib/monopoly/dice";

// 200 格 @60fps；2.6 倍約 1.3 秒落定，跟大富翁的骰子手感一樣
const PLAYBACK_SPEED = 2.6;

type Throws = { fps: number; sets: number[][][][] };
let assets: Promise<[THREE.Group, Throws]> | undefined;
export function loadDiceAssets() {
  return (assets ??= Promise.all([
    new GLTFLoader().loadAsync("/3d_model/monopoly-die.glb").then((g) => g.scene),
    fetch("/3d_model/dice-throws.json").then((r) => {
      if (!r.ok) throw new Error("Dice throws unavailable");
      return r.json() as Promise<Throws>;
    }),
  ]).catch((error) => {
    assets = undefined;
    throw error;
  }));
}

// BoxGeometry 的六個材質群組依序是 +x −x +y −y +z −z；換算成點數才對得上 DIE_NORMALS
const GROUP_VALUES = [2, 5, 1, 6, 4, 3];

/** 每一面貼圖「字的上方」在骰子座標裡指向哪裡，從 BoxGeometry 的 UV 反推，不靠手抄 */
const FACE_UP = (() => {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const pos = box.getAttribute("position");
  const uv = box.getAttribute("uv");
  const index = box.getIndex()!;
  const up: THREE.Vector3[] = [];
  box.groups.forEach((group, g) => {
    const [a, b, c] = [0, 1, 2].map((k) => index.getX(group.start + k));
    const p0 = new THREE.Vector3().fromBufferAttribute(pos, a);
    const e1 = new THREE.Vector3().fromBufferAttribute(pos, b).sub(p0);
    const e2 = new THREE.Vector3().fromBufferAttribute(pos, c).sub(p0);
    const [du1, dv1] = [uv.getX(b) - uv.getX(a), uv.getY(b) - uv.getY(a)];
    const [du2, dv2] = [uv.getX(c) - uv.getX(a), uv.getY(c) - uv.getY(a)];
    const r = du1 * dv2 - du2 * dv1;
    up[GROUP_VALUES[g] - 1] = e2.multiplyScalar(du1).sub(e1.multiplyScalar(du2)).divideScalar(r).normalize();
  });
  box.dispose();
  return up;
})();

function faceTexture(text: string, font: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = BRAND.paperWarm;
  ctx.fillRect(0, 0, size, size);
  const chars = Array.from(text);
  // 四個字以上折成兩行，字才不會縮到後排看不見
  const lines = chars.length > 3 ? [chars.slice(0, Math.ceil(chars.length / 2)), chars.slice(Math.ceil(chars.length / 2))] : [chars];
  const longest = Math.max(...lines.map((l) => l.length));
  const px = Math.min(150, (size * 0.8) / longest, (size * 0.78) / lines.length / 1.15);
  ctx.fillStyle = BRAND.ink;
  ctx.font = `900 ${px}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, i) =>
    ctx.fillText(line.join(""), size / 2, size / 2 + (i - (lines.length - 1) / 2) * px * 1.15),
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function textDie(faces: string[]) {
  const font = getComputedStyle(document.body).fontFamily;
  const materials = GROUP_VALUES.map(
    (value) => new THREE.MeshStandardMaterial({ map: faceTexture(faces[value - 1], font), roughness: 0.3 }),
  );
  return new THREE.Mesh(new RoundedBoxGeometry(1, 1, 1, 4, 0.075), materials);
}

/**
 * 文字骰落地後，把朝上那面的字轉正到面向鏡頭。繞著那一面的法線轉，
 * 等於在落地的世界座標裡繞垂直軸轉，軌跡本身不受影響。
 */
function faceCamera(value: number, landing: THREE.Quaternion, orient: THREE.Quaternion) {
  const up = FACE_UP[value - 1].clone().applyQuaternion(orient).applyQuaternion(landing);
  const angle = Math.atan2(up.x, -up.z);
  return orient.clone().multiply(new THREE.Quaternion().setFromAxisAngle(DIE_NORMALS[value - 1], angle));
}

export default function DiceTray({
  values,
  mode,
  faces,
  still = false,
  onSettled,
}: {
  values: number[];
  mode: DiceMode;
  faces: string[];
  still?: boolean;
  onSettled?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const settled = useRef(onSettled);
  useEffect(() => {
    settled.current = onSettled;
  }, [onSettled]);
  const [failed, setFailed] = useState(false);
  const key = values.join(",");
  const facesKey = mode === "text" ? faces.join("\n") : "";

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let observer: ResizeObserver | undefined;
    const disposables: { dispose: () => void }[] = [];
    let finished = false;
    const finish = () => {
      if (finished || disposed) return;
      finished = true;
      settled.current?.();
    };
    setFailed(false);

    Promise.all([loadDiceAssets(), mode === "text" ? document.fonts.ready : null])
      .then(([[model, throws]]) => {
        if (disposed) return;
        const rolled = key.split(",").map(Number);
        const tracks = throws.sets[rolled.length - 1];
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.setClearColor(0, 0);
        container.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, 0.1, 100);
        // 比大富翁更接近俯視：朝上那面是答案，側面露太多反而搶視線
        camera.position.set(0, 14, 6);
        camera.lookAt(0, 0.5, 0);
        camera.updateMatrixWorld();
        scene.add(new THREE.HemisphereLight(0xffffff, 0x74664f, 3));
        const light = new THREE.DirectionalLight(0xfff2dc, 4);
        light.position.set(-3, 10, 5);
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        Object.assign(light.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
        light.shadow.normalBias = 0.025;
        scene.add(light);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: 0.22 }));
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.008;
        ground.receiveShadow = true;
        scene.add(ground);
        disposables.push(ground.geometry, ground.material);

        const dice = rolled.map((value, i) => {
          const track = tracks[i];
          const landing = new THREE.Quaternion().fromArray(track[track.length - 1], 3);
          const orient = orientDie(value, landing);
          let mesh: THREE.Object3D;
          if (mode === "text") {
            const die = textDie(faces);
            disposables.push(die.geometry, ...(die.material as THREE.MeshStandardMaterial[]).flatMap((m) => [m.map!, m]));
            die.quaternion.copy(faceCamera(value, landing, orient));
            mesh = die;
          } else {
            mesh = model.clone(true);
            mesh.quaternion.copy(orient);
          }
          mesh.traverse((object) => {
            if (object instanceof THREE.Mesh) object.castShadow = true;
          });
          const pivot = new THREE.Group();
          pivot.add(mesh);
          scene.add(pivot);
          return { pivot, track };
        });

        // 取景框住落點，骰子落定後才夠大；拋起的那一段短暫出框沒關係
        const view = new THREE.Box2();
        const corner = new THREE.Vector3();
        for (const track of tracks) {
          const [x, , z] = track[track.length - 1];
          for (const dx of [-0.85, 0.85])
            for (const dz of [-0.85, 0.85])
              for (const y of [0, 1.2]) {
                corner.set(x + dx, y, z + dz).applyMatrix4(camera.matrixWorldInverse);
                view.expandByPoint(new THREE.Vector2(corner.x, corner.y));
              }
        }
        const center = view.getCenter(new THREE.Vector2());
        const extent = view.getSize(new THREE.Vector2());

        const resize = () => {
          if (!renderer) return;
          const width = container.clientWidth;
          const height = container.clientHeight;
          renderer.setSize(width, height);
          const aspect = width / Math.max(height, 1);
          const spanY = Math.max(extent.y, extent.x / aspect) * 1.08;
          camera.left = center.x - (spanY * aspect) / 2;
          camera.right = center.x + (spanY * aspect) / 2;
          camera.top = center.y + spanY / 2;
          camera.bottom = center.y - spanY / 2;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        observer = new ResizeObserver(resize);
        observer.observe(container);
        resize();

        const last = tracks[0].length - 1;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const start = performance.now();
        const animate = (now: number) => {
          if (disposed || !renderer) return;
          const tick = reduced || still ? last : ((now - start) / 1000) * throws.fps * PLAYBACK_SPEED;
          for (const { pivot, track } of dice) {
            const pose = sampleDie(track, tick);
            pivot.position.copy(pose.position);
            pivot.quaternion.copy(pose.rotation);
          }
          renderer.render(scene, camera);
          if (tick >= last) finish();
          else frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      })
      .catch(() => {
        if (!disposed) {
          setFailed(true);
          finish();
        }
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
    };
    // faces 以 facesKey 代表：陣列每次 render 都是新的參考，內容沒變就不重建場景
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, mode, facesKey, still]);

  return (
    <div className="relative h-full w-full">
      <div ref={host} className="h-full w-full" aria-hidden="true" />
      {failed && (
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-6 text-7xl text-ink" aria-hidden="true">
          {values.map((v, i) => (
            <span key={i}>{mode === "text" ? faces[v - 1] : ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][v - 1]}</span>
          ))}
        </div>
      )}
    </div>
  );
}
