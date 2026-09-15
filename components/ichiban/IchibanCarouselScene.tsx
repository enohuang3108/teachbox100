"use client";

import type { MotionValue } from "motion/react";
import {
  useEffect,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function IchibanCarouselScene({
  rotation,
  focus,
  count,
  activeIndex,
  onTicketClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  onReady,
  onError,
}: {
  rotation: MotionValue<number>;
  focus: MotionValue<number>;
  count: number;
  activeIndex: number;
  onTicketClick: (index: number) => void;
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
  onPointerMove: PointerEventHandler<HTMLButtonElement>;
  onPointerUp: PointerEventHandler<HTMLButtonElement>;
  onPointerCancel: PointerEventHandler<HTMLButtonElement>;
  onKeyDown: KeyboardEventHandler<HTMLButtonElement>;
  onReady: () => void;
  onError: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const itemsRef = useRef<THREE.Group[]>([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const activeRef = useRef(activeIndex);
  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0.35, 9.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 燈光和 IchibanTicket3D 相同，只是換到票面朝 +Z 的座標系（(x, y, z) → (x, -z, y)），
    // 切到撕票畫面時顏色才不會跳。
    const hemi = new THREE.HemisphereLight(0xfff8ea, 0x667080, 2.4);
    hemi.position.set(0, 0, 1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 3.6);
    key.position.set(-3, -8, 5);
    scene.add(key);

    const carousel = new THREE.Group();
    scene.add(carousel);
    let disposed = false;

    const render = () => renderer.render(scene, camera);
    const applyRotation = () => {
      const value = rotation.get();
      // focus 0→1：選中的票券轉回水平、放大到畫面中間，其他票券淡出。
      const f = focus.get();
      // 終點要和撕票畫面（正交相機、視高 3.25、票券框 aspect 2.15 / 1.72）同尺寸同位置，切換才不會跳。
      const depthZ = 2.05;
      const unitsPerPx =
        (2 * (camera.position.z - depthZ) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / (canvas.clientHeight || 1);
      const tearHeight = canvas.clientWidth / (window.matchMedia("(min-width: 640px)").matches ? 2.15 : 1.72);
      // 位移校正值是實測截圖後補的版面偏移（約 9px）。
      const focusScale = (tearHeight / 3.25) * unitsPerPx;
      const focusX = 9 * unitsPerPx;
      const focusY =
        ((canvas.clientHeight - tearHeight) / 2 - 9) * unitsPerPx + (camera.position.y * depthZ) / camera.position.z;
      itemsRef.current.forEach((item, index) => {
        const angle = THREE.MathUtils.degToRad(index * (360 / count) + value);
        const depth = Math.cos(angle);
        const facingAngle = Math.atan2(Math.sin(angle), Math.cos(angle));
        const isFocused = index === activeRef.current && f > 0;
        const k = isFocused ? f : 0;
        // 放大晚一點起步，斜著轉的時候票券對角線才不會超出 canvas 被裁掉。
        const ks = THREE.MathUtils.smoothstep(k, 0.3, 1);
        item.position.set(
          THREE.MathUtils.lerp(Math.sin(angle) * 4.05, focusX, k),
          THREE.MathUtils.lerp(-Math.abs(Math.sin(angle)) * 0.12, focusY, k),
          depth * depthZ,
        );
        item.rotation.set(Math.PI / 2, facingAngle * 0.72 * (1 - k), 0, "YXZ");
        const itemScale = THREE.MathUtils.lerp(0.48 + Math.max(0, depth) * 0.05, focusScale, ks);
        // 實測撕票畫面的票券高約 0.8%（寬一致），只補垂直方向。
        // scale 套在 rotation.x = 90° 之前，所以畫面垂直方向是本地 z，不是 y。
        item.scale.set(itemScale, itemScale, itemScale * (1 + 0.008 * ks));
        item.children[0].rotation.y = (Math.PI / 2) * (1 - k);
        // 只顯示圓環面向觀眾的半圈，避免後排票券露出黑色紙背。
        item.visible = isFocused || (depth > 0 && f < 0.25);
      });
      render();
    };
    const fit = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = camera.aspect < 1 ? 11.8 : 9.4;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      render();
    };

    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    const stopRotation = rotation.on("change", applyRotation);
    const stopFocus = focus.on("change", applyRotation);

    new GLTFLoader().load(
      "/3d_model/ichiban-crayon.glb",
      (gltf) => {
        if (disposed) return;
        const items = Array.from({ length: count }, (_, index) => {
          const item = new THREE.Group();
          item.userData.ticketIndex = index;
          const model = gltf.scene.clone(true);
          model.traverse((object) => {
            if (object instanceof THREE.Mesh && object.morphTargetInfluences) {
              object.morphTargetInfluences.fill(0);
            }
          });
          // 繞票面法線轉 90° 讓票券直立、正面仍朝使用者；選中後由 focus 轉回橫的。
          model.rotation.y = Math.PI / 2;
          const center =new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
          model.position.sub(center);
          item.add(model);
          carousel.add(item);
          return item;
        });
        itemsRef.current = items;
        applyRotation();
        fit();
        onReady();
      },
      undefined,
      () => {
        if (!disposed) onError();
      },
    );

    return () => {
      disposed = true;
      observer.disconnect();
      stopRotation();
      stopFocus();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      carousel.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        objectMaterials.forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      itemsRef.current = [];
      cameraRef.current = null;
      renderer.dispose();
    };
  }, [count, focus, onError, onReady, rotation]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    if (!canvas || !camera) return;
    const bounds = canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycasterRef.current.setFromCamera(pointer, camera);
    const hit = raycasterRef.current.intersectObjects(itemsRef.current, true)[0]?.object;
    let target: THREE.Object3D | null = hit ?? null;
    while (target && typeof target.userData.ticketIndex !== "number") target = target.parent;
    if (target) onTicketClick(target.userData.ticketIndex as number);
  };

  return (
    <button
      type="button"
      aria-label={`旋轉一番賞票券，目前是第 ${activeIndex + 1} 張`}
      className="block size-full touch-none outline-offset-4"
      onClick={handleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={onKeyDown}
    >
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none block size-full" />
    </button>
  );
}
