"use client";
import { cn } from "@/lib/utils";
import { animate, JSAnimation } from "animejs"; // 引入 animejs
import React, { useEffect, useRef } from "react";

export interface WithMouseProps {
  initialDamping?: number; // 初始阻尼，用於近距離時
  maxDamping?: number; // 最大阻尼，用於遠距離時
  dampingFactor?: number; // 阻尼因子，控制阻尼隨距離增長的程度
  className?: string;
}

export function withMouse<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithMouseComponent(props: P & WithMouseProps) {
    const {
      initialDamping = 0.01, // 預設初始阻尼
      maxDamping = 0.0001, // 預設最大阻尼
      dampingFactor = 0.05, // 預設阻尼因子
      className,
      ...restProps
    } = props;

    const componentRef = useRef<HTMLDivElement>(null);
    const targetX = useRef(0);
    const targetY = useRef(0);
    const currentX = useRef(0);
    const currentY = useRef(0);
    const animationRef = useRef<JSAnimation | null>(null);

    useEffect(() => {
      const updatePosition = () => {
        // 計算當前位置與目標位置的距離
        const distance = Math.sqrt(
          Math.pow(targetX.current - currentX.current, 2) +
            Math.pow(targetY.current - currentY.current, 2)
        );

        // 根據距離動態調整阻尼值
        // 距離越遠，阻尼越大，但不會超過 maxDamping
        const dynamicDamping = Math.min(
          initialDamping + distance * dampingFactor,
          maxDamping
        );

        // 使用動態阻尼來平滑移動
        currentX.current += (targetX.current - currentX.current) * dynamicDamping;
        currentY.current += (targetY.current - currentY.current) * dynamicDamping;

        if (componentRef.current) {
          if (animationRef.current) {
            animationRef.current.seek(0); // 重置動畫進度
            animationRef.current.pause(); // 暫停之前的動畫
          }
          animationRef.current = animate(componentRef.current, {
            translateX: currentX.current,
            translateY: currentY.current,
            duration: 0, // 立即更新
            easing: "linear",
          });
        }
      };

      const onMouseMove = (e: MouseEvent) => {
        if (componentRef.current) {
          const { width, height, left, top } =
            componentRef.current.getBoundingClientRect();
          const hw = width / 2;
          const hh = height / 2;

          // 計算滑鼠相對於元件中心的位置
          targetX.current = e.clientX - left - hw;
          targetY.current = e.clientY - top - hh;
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      const frameId = requestAnimationFrame(function animate() {
        updatePosition();
        requestAnimationFrame(animate);
      });

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        cancelAnimationFrame(frameId);
        if (animationRef.current) {
          animationRef.current.pause();
        }
      };
    }, [initialDamping, maxDamping, dampingFactor]); // 將新的 props 加入依賴數組

    return (
      <div ref={componentRef} className={cn("inline-block", className)}>
        <WrappedComponent {...(restProps as P)} />
      </div>
    );
  };
}
