"use client";

import { fitPrizeTextSize, prizeRevealProgress } from "@/lib/ichiban/tear";
import type { MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function IchibanTicket3D({
  progress,
  prize,
  onReady,
  onError,
}: {
  progress: MotionValue<number>;
  prize: { rank: string; name: string; message: string };
  onReady: () => void;
  onError: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-4, 4, 2, -2, 0.1, 50);
    camera.position.set(0, 8, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xfff8ea, 0x667080, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 3.6);
    key.position.set(-3, 5, 8);
    scene.add(key);

    let root: THREE.Group | null = null;
    let prizeLabel: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;
    const prizeReveal = { value: 0 };
    const peelParts: THREE.Mesh[] = [];
    let disposed = false;

    const render = () => renderer.render(scene, camera);
    const fit = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      const viewHeight = 3.25;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.left = -(viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.updateProjectionMatrix();
      render();
    };

    const applyProgress = (value: number) => {
      canvas.dataset.peelProgress = value.toFixed(3);
      prizeReveal.value = prizeRevealProgress(value);
      const scaled = Math.min(1, Math.max(0, value)) * 20;
      peelParts.forEach((part) => {
        part.visible = value < 0.985;
        const influences = part.morphTargetInfluences;
        if (!influences) return;
        influences.fill(0);
        if (scaled <= 1) {
          influences[0] = scaled;
        } else {
          const lower = Math.min(19, Math.floor(scaled) - 1);
          const blend = scaled - Math.floor(scaled);
          influences[lower] = blend === 0 ? 1 : 1 - blend;
          if (lower < 19 && blend > 0) influences[lower + 1] = blend;
        }
      });
      render();
    };

    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    const stopProgress = progress.on("change", applyProgress);

    new GLTFLoader().load(
      "/3d_model/ichiban-crayon.glb",
      (gltf) => {
        if (disposed) return;
        root = gltf.scene;
        root.traverse((object) => {
          if (object instanceof THREE.Mesh && object.morphTargetInfluences?.length === 20) peelParts.push(object);
        });
        canvas.dataset.morphTargets = String(peelParts.length);
        const bounds = new THREE.Box3().setFromObject(root);
        const center = bounds.getCenter(new THREE.Vector3());
        root.position.sub(center);
        scene.add(root);

        // 獎項必須位於底紙與可撕封條之間，不能用 HTML 蓋在 WebGL 上方。
        // 透明文字平面會被前方的封條與翻折背面寫入的 depth 自然遮住。
        const labelCanvas = document.createElement("canvas");
        labelCanvas.width = 1536;
        labelCanvas.height = 512;
        const context = labelCanvas.getContext("2d");
        if (context) {
          const family = getComputedStyle(document.body).fontFamily;
          context.textAlign = "center";
          context.textBaseline = "middle";

          const drawFittedText = ({
            text,
            y,
            weight,
            preferredSize,
            minimumSize,
            availableWidth,
            color,
          }: {
            text: string;
            y: number;
            weight: number;
            preferredSize: number;
            minimumSize: number;
            availableWidth: number;
            color: string;
          }) => {
            context.font = `${weight} ${preferredSize}px ${family}`;
            const size = fitPrizeTextSize(
              context.measureText(text).width,
              availableWidth,
              preferredSize,
              minimumSize,
            );
            context.fillStyle = color;
            context.font = `${weight} ${size}px ${family}`;
            context.fillText(text, 768, y);
          };

          drawFittedText({
            text: prize.rank,
            y: 155,
            weight: 900,
            preferredSize: 190,
            minimumSize: 92,
            availableWidth: 1120,
            color: "#cb2108",
          });
          drawFittedText({
            text: prize.name,
            y: 340,
            weight: 900,
            preferredSize: 92,
            minimumSize: 48,
            availableWidth: 1260,
            color: "#020d15",
          });
          drawFittedText({
            text: prize.message,
            y: 440,
            weight: 800,
            preferredSize: 42,
            minimumSize: 26,
            availableWidth: 1260,
            color: "#4a5560",
          });

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
            shader.uniforms.prizeReveal = prizeReveal;
            shader.fragmentShader = shader.fragmentShader
              .replace(
                "#include <map_pars_fragment>",
                "#include <map_pars_fragment>\nuniform float prizeReveal;",
              )
              .replace(
                "#include <map_fragment>",
                "if (vMapUv.x > prizeReveal) discard;\n#include <map_fragment>",
              );
          };
          material.customProgramCacheKey = () => "ichiban-prize-progressive-reveal-v1";
          prizeLabel = new THREE.Mesh(new THREE.PlaneGeometry(5.25, 1.58), material);
          prizeLabel.name = "Prize_label_on_inner_paper";
          prizeLabel.position.set(0, 0.072, 0);
          prizeLabel.rotation.x = -Math.PI / 2;
          scene.add(prizeLabel);
        }

        applyProgress(progress.get());
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
      stopProgress();
      root?.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      if (prizeLabel) {
        prizeLabel.geometry.dispose();
        prizeLabel.material.map?.dispose();
        prizeLabel.material.dispose();
      }
      renderer.dispose();
    };
  }, [onError, onReady, prize.message, prize.name, prize.rank, progress]);

  return <canvas ref={canvasRef} className="block size-full" aria-hidden />;
}
