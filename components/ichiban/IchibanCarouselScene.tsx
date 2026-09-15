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

    scene.add(new THREE.HemisphereLight(0xfff8ea, 0x526272, 2.7));
    const key = new THREE.DirectionalLight(0xffffff, 3.8);
    key.position.set(-4, 6, 8);
    scene.add(key);

    const carousel = new THREE.Group();
    scene.add(carousel);
    let disposed = false;

    const render = () => renderer.render(scene, camera);
    const applyRotation = (value: number) => {
      itemsRef.current.forEach((item, index) => {
        const angle = THREE.MathUtils.degToRad(index * (360 / count) + value);
        const depth = Math.cos(angle);
        const facingAngle = Math.atan2(Math.sin(angle), Math.cos(angle));
        item.position.set(Math.sin(angle) * 4.05, -Math.abs(Math.sin(angle)) * 0.12, depth * 2.05);
        item.rotation.set(Math.PI / 2, facingAngle * 0.72, 0, "YXZ");
        item.scale.setScalar(0.48 + Math.max(0, depth) * 0.05);
        // 只顯示圓環面向觀眾的半圈，避免後排票券露出黑色紙背。
        item.visible = depth > 0;
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
          const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
          model.position.sub(center);
          item.add(model);
          carousel.add(item);
          return item;
        });
        itemsRef.current = items;
        applyRotation(rotation.get());
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
  }, [count, onError, onReady, rotation]);

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
