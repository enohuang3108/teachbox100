"use client";

import { fitPrizeTextSize, prizeRevealProgress } from "@/lib/ichiban/tear";
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
import type { IchibanPrize } from "@/lib/ichiban/prizes";
import { BRAND } from "@/lib/design-tokens";

const PEEL_MORPH_COUNT = 20;

function applyPeel(parts: THREE.Mesh[], value: number) {
  const scaled = Math.min(1, Math.max(0, value)) * PEEL_MORPH_COUNT;
  parts.forEach((part) => {
    part.visible = value < 0.985;
    const influences = part.morphTargetInfluences;
    if (!influences) return;
    influences.fill(0);
    if (scaled <= 1) {
      influences[0] = scaled;
    } else {
      const lower = Math.min(PEEL_MORPH_COUNT - 1, Math.floor(scaled) - 1);
      const blend = scaled - Math.floor(scaled);
      influences[lower] = blend === 0 ? 1 : 1 - blend;
      if (lower < PEEL_MORPH_COUNT - 1 && blend > 0) influences[lower + 1] = blend;
    }
  });
}

// 獎項必須位於底紙與可撕封條之間，不能用 HTML 蓋在 WebGL 上方。
// 透明文字平面會被前方的封條與翻折背面寫入的 depth 自然遮住。
function createPrizeLabel(prize: IchibanPrize, renderer: THREE.WebGLRenderer, reveal: { value: number }) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 1536;
  labelCanvas.height = 430;
  const context = labelCanvas.getContext("2d");
  if (!context) return null;
  const family = getComputedStyle(document.body).fontFamily;
  context.textAlign = "center";
  context.textBaseline = "middle";

  const drawFittedText = (
    text: string,
    y: number,
    weight: number,
    preferredSize: number,
    minimumSize: number,
    availableWidth: number,
    color: string,
  ) => {
    context.font = `${weight} ${preferredSize}px ${family}`;
    const size = fitPrizeTextSize(context.measureText(text).width, availableWidth, preferredSize, minimumSize);
    context.fillStyle = color;
    context.font = `${weight} ${size}px ${family}`;
    context.fillText(text, 768, y);
  };
  drawFittedText(prize.rank, 145, 900, 190, 92, 1120, BRAND.red);
  drawFittedText(prize.name, 300, 900, 92, 48, 1260, BRAND.ink);

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.prizeReveal = reveal;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <map_pars_fragment>", "#include <map_pars_fragment>\nuniform float prizeReveal;")
      .replace("#include <map_fragment>", "if (vMapUv.x > prizeReveal) discard;\n#include <map_fragment>");
  };
  material.customProgramCacheKey = () => "ichiban-prize-progressive-reveal-v1";
  const label = new THREE.Mesh(new THREE.PlaneGeometry(5.25, 1.58), material);
  label.name = "Prize_label_on_inner_paper";
  label.rotation.x = -Math.PI / 2;
  return label;
}

export function IchibanCarouselScene({
  rotation,
  focus,
  progress,
  prize,
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
  /** 0→1：選中的票券轉回水平、放大到畫面中間，其他票券淡出。 */
  focus: MotionValue<number>;
  /** 0→1：選中票券的封條撕開進度。 */
  progress: MotionValue<number>;
  /** 有值時把獎項文字放進選中的票券；選票階段為 null。 */
  prize: IchibanPrize | null;
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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderRef = useRef(() => {});
  const itemsRef = useRef<THREE.Group[]>([]);
  const peelRef = useRef<THREE.Mesh[]>([]);
  const revealRef = useRef({ value: 0 });
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
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0, 9.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 票面朝 +Z，天光從票面正前方來，主光偏左下前方。
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
    renderRef.current = render;
    const applyRotation = () => {
      const value = rotation.get();
      const f = focus.get();
      const depthZ = 2.05;
      // 輪播時正視；選中後鏡頭降到票券略下方，票面呈下寬上窄的微正梯形。
      camera.position.y = THREE.MathUtils.lerp(0, -0.55, THREE.MathUtils.smoothstep(f, 0, 1));
      camera.lookAt(0, 0, 0);
      const unitsPerPx =
        (2 * (camera.position.z - depthZ) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / (canvas.clientHeight || 1);
      // 畫布比票券本體大，保留安全邊距給向右掀開的封條。Canvas 的繪製邊界
      // 本身無法用 CSS overflow 突破，因此票券不能再塞滿整個畫布。
      const desktop = window.matchMedia("(min-width: 640px)").matches;
      const ticketFrameHeight =
        // 畫布比版面寬 1.6 倍（左右各出血 30%），票券大小仍以版面寬度計算。
        ((canvas.clientWidth / 1.6) * (desktop ? 0.6 : 0.7)) /
        (desktop ? 2.15 : 1.72);
      const focusScale = (ticketFrameHeight / 3.25) * unitsPerPx;
      // 鏡頭略微俯視，補回讓票券中心落在畫布正中。
      const focusY = (camera.position.y * depthZ) / camera.position.z;
      itemsRef.current.forEach((item, index) => {
        const angle = THREE.MathUtils.degToRad(index * (360 / count) + value);
        const depth = Math.cos(angle);
        const isFocused = index === activeRef.current && f > 0;
        const k = isFocused ? f : 0;
        // 放大晚一點起步，斜著轉的時候票券對角線才不會超出 canvas 被裁掉。
        const ks = THREE.MathUtils.smoothstep(k, 0.3, 1);
        item.position.set(
          Math.sin(angle) * 4.05 * (1 - k),
          THREE.MathUtils.lerp(0, focusY, k),
          depth * depthZ,
        );
        // 前後排都讓票面朝鏡頭，兩側只微微斜向中間，後排才不會露出紙背。
        item.rotation.set(Math.PI / 2, Math.sin(angle) * 0.3 * (1 - k), 0, "YXZ");
        item.scale.setScalar(THREE.MathUtils.lerp(0.46 + depth * 0.06, focusScale, ks));
        item.children[0].rotation.y = (Math.PI / 2) * (1 - k);
        item.visible = isFocused || f < 0.25;
        // 越靠後越小、越偏白灰（不用透明，避免封條下層透出來變髒）。
        const wash = isFocused ? 0 : THREE.MathUtils.clamp((0.3 - depth) / 1.3, 0, 1) * 0.75;
        item.traverse((object) => {
          if (!(object instanceof THREE.Mesh) || object.name === "Prize_label_on_inner_paper") return;
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((base) => {
            const material = base as THREE.MeshStandardMaterial;
            material.userData.baseColor ??= material.color?.clone();
            material.color?.copy(material.userData.baseColor).multiplyScalar(1 - wash * 0.25);
            if (material.emissive) {
              material.emissive.setScalar(1);
              material.emissiveIntensity = wash * 0.6;
            }
          });
        });
      });
      render();
    };
    const applyProgress = () => {
      const value = progress.get();
      revealRef.current.value = prizeRevealProgress(value);
      applyPeel(peelRef.current, value);
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
      applyRotation();
    };

    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    const stopRotation = rotation.on("change", applyRotation);
    const stopFocus = focus.on("change", applyRotation);
    const stopProgress = progress.on("change", applyProgress);

    new GLTFLoader().load(
      "/3d_model/ichiban-crayon.glb",
      (gltf) => {
        if (disposed) return;
        const items = Array.from({ length: count }, (_, index) => {
          const item = new THREE.Group();
          item.userData.ticketIndex = index;
          // clone 會複製 morphTargetInfluences，每張票券的封條各自獨立。
          const model = gltf.scene.clone(true);
          model.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            object.morphTargetInfluences?.fill(0);
            // 每張票券各自一份材質，後排才能單獨淡化。
            object.material = Array.isArray(object.material)
              ? object.material.map((material) => material.clone())
              : object.material.clone();
          });
          // 繞票面法線轉 90° 讓票券直立、正面仍朝使用者；選中後由 focus 轉回橫的。
          model.rotation.y = Math.PI / 2;
          const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
          model.position.sub(center);
          item.add(model);
          carousel.add(item);
          return item;
        });
        itemsRef.current = items;
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
      stopProgress();
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
      peelRef.current = [];
      cameraRef.current = null;
      rendererRef.current = null;
      renderRef.current = () => {};
      renderer.dispose();
    };
  }, [count, focus, onError, onReady, progress, rotation]);

  useEffect(() => {
    const item = itemsRef.current[activeRef.current];
    const renderer = rendererRef.current;
    if (!prize || !item || !renderer) return;
    const model = item.children[0];
    const parts: THREE.Mesh[] = [];
    model.traverse((object) => {
      if (object instanceof THREE.Mesh && object.morphTargetInfluences?.length === PEEL_MORPH_COUNT) parts.push(object);
    });
    peelRef.current = parts;
    revealRef.current.value = 0;
    const label = createPrizeLabel(prize, renderer, revealRef.current);
    if (label) {
      // model 本身被平移了 -center；label 放回票券中心、底紙上方一點。
      label.position.set(-model.position.x, -model.position.y + 0.072, -model.position.z);
      model.add(label);
    }
    renderRef.current();
    return () => {
      peelRef.current = [];
      if (label) {
        model.remove(label);
        label.geometry.dispose();
        label.material.map?.dispose();
        label.material.dispose();
      }
      renderRef.current();
    };
  }, [prize]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    // 鍵盤 Enter / Space 觸發的 click 沒有座標，直接選目前正面的票券。
    if (event.detail === 0) {
      onTicketClick(activeIndex);
      return;
    }
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
      className="block size-full touch-none outline-none"
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
