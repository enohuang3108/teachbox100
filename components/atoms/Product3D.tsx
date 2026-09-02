"use client";

import React, { useEffect, useState, useRef } from "react";

interface Product3DProps {
  modelPath: string;
  productName: string;
  price?: number;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  size?: "small" | "medium" | "large";
}

export const Product3D = ({
  modelPath,
  productName,
  className = "",
  autoRotate = true,
  cameraControls = true,
  size = "large",
}: Product3DProps) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [_isClient, setIsClient] = useState(false);
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    // 確保只在客戶端執行
    setIsClient(true);
    // 動態載入 model-viewer，避免 SSR 問題
    import("@google/model-viewer");
  }, []);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    const handleProgress = (event: any) => {
      const progress = event.detail.totalProgress;
      setLoadingProgress(progress);
    };

    const handleLoad = () => {
      // 確保模型完全載入和渲染
      setIsModelLoaded(true);
    };

    const handleError = () => {
      console.warn(`Failed to load model: ${modelPath}`);
      // 載入失敗時可以選擇隱藏載入模型或顯示錯誤狀態
    };

    // 監聽模型載入事件
    modelViewer.addEventListener("progress", handleProgress);
    modelViewer.addEventListener("load", handleLoad);
    modelViewer.addEventListener("error", handleError);

    return () => {
      modelViewer.removeEventListener("progress", handleProgress);
      modelViewer.removeEventListener("load", handleLoad);
      modelViewer.removeEventListener("error", handleError);
    };
  }, [modelPath]);

  // 根據尺寸設定不同的大小和攝影機參數。
  // size 是「上限」不是固定值：容器窄的時候（商品架被擠成一半寬、全螢幕分欄）
  // 模型跟著縮，不會溢出格子。
  const sizeConfig = {
    small: {
      containerClass: "aspect-square w-full max-w-24",
      cameraOrbit: "0deg 75deg 1m",
      fieldOfView: "35deg",
      progressBarWidth: "w-16",
    },
    medium: {
      containerClass: "aspect-square w-full max-w-32",
      cameraOrbit: "0deg 75deg 1.2m",
      fieldOfView: "32deg",
      progressBarWidth: "w-20",
    },
    large: {
      containerClass: "aspect-square w-full max-w-64",
      cameraOrbit: "0deg 75deg 1.5m",
      fieldOfView: "30deg",
      progressBarWidth: "w-32",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex w-full flex-col items-center ${className}`}>
      <div className={`relative ${config.containerClass}`}>
        {/* 載入進度指示器 */}
        {!isModelLoaded && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
            <div
              className={`${config.progressBarWidth} h-1 bg-black/20 backdrop-blur-sm rounded-full overflow-hidden`}
            >
              <div
                className="h-full bg-gray-400 transition-all duration-300"
                style={{ width: `${loadingProgress * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 產品模型 */}
        <model-viewer
          ref={modelViewerRef}
          src={modelPath}
          alt={`3D 模型：${productName}`}
          auto-rotate={autoRotate}
          camera-controls={cameraControls}
          disable-zoom={true}
          interaction-prompt="none"
          camera-orbit={config.cameraOrbit}
          field-of-view={config.fieldOfView}
          shadow-intensity="0"
          environment-image="neutral"
          loading="auto"
          reveal="auto"
          className="h-full w-full rounded-lg"
          style={
            {
              width: "100%",
              height: "100%",
              "--progress-bar-color": "transparent",
              "--progress-bar-height": "0px",
            } as React.CSSProperties
          }
        ></model-viewer>
      </div>
    </div>
  );
};
