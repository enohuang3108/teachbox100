"use client";

import { motion, useAnimate, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

// 金額顯示：數字滾動跳動，金額增減時彈一下並閃色（增綠減紅，回落翡翠綠）
export function MoneyDisplay({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const spring = useSpring(value, { stiffness: 150, damping: 22, mass: 0.6 });
  const text = useTransform(spring, (v) => `$${Math.round(v).toLocaleString()}`);
  const prev = useRef(value);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    spring.set(value);
    if (value === prev.current) return;
    const gain = value > prev.current;
    prev.current = value;
    // 彈跳（overshoot 緩動）+ 閃色後回落翡翠綠
    animate(
      scope.current,
      { scale: [1, 1.3, 1] },
      { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
    );
    animate(
      scope.current,
      { color: [gain ? "#10b981" : "#ef4444", "#047857"] },
      { duration: 0.7, ease: "easeOut" },
    );
  }, [value, spring, animate, scope]);

  return (
    <motion.span ref={scope} className={className}>
      {text}
    </motion.span>
  );
}
