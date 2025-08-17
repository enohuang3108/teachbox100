"use client";

import React, { useEffect, useState, useRef } from "react";

interface Product3DProps {
  modelPath: string;
  productName: string;
  price?: number;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
}

export const Product3D = ({
  modelPath,
  productName,
  className = "",
  autoRotate = true,
  cameraControls = true,
}: Product3DProps) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
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

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative h-64 w-64">
        {/* 載入進度指示器 */}
        {!isModelLoaded && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="w-32 h-1 bg-black/20 backdrop-blur-sm rounded-full overflow-hidden">
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
          camera-orbit="0deg 75deg 1.5m"
          field-of-view="30deg"
          shadow-intensity="0"
          environment-image="neutral"
          loading="auto"
          reveal="auto"
          className="h-64 w-64 rounded-lg"
          style={
            {
              width: "256px",
              height: "256px",
              "--progress-bar-color": "transparent",
              "--progress-bar-height": "0px",
            } as React.CSSProperties
          }
        ></model-viewer>
      </div>
    </div>
  );
};
