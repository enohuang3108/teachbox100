"use client";

import React, { useEffect } from "react";

interface Product3DProps {
  modelPath: string;
  productName: string;
  price?: number;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
}

export const
Product3D: React.FC<Product3DProps> = ({
  modelPath,
  productName,
  className = "",
  autoRotate = true,
  cameraControls = true,
}) => {
  useEffect(() => {
    // 動態載入 model-viewer，避免 SSR 問題
    import("@google/model-viewer");
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
        <model-viewer
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
          style={{
            width: "256px",
            height: "256px",
          }}
        ></model-viewer>
      </div>
  );
};
