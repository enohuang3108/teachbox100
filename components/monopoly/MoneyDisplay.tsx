"use client";

import {
  AnimatePresence,
  motion,
  useAnimate,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

// 金額顯示：數字滾動跳動，金額增減時彈一下並閃色，
// 並在上方浮出 +$X／−$X 跳字（收綠付紅、向上飄淡出），讓收租／過起點等金流一眼看到。
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
  const seq = useRef(0);
  const [scope, animate] = useAnimate();
  const [delta, setDelta] = useState<{ amount: number; id: number } | null>(
    null,
  );

  useEffect(() => {
    spring.set(value);
    if (value === prev.current) return;
    const diff = value - prev.current;
    const gain = diff > 0;
    prev.current = value;
    // 彈跳（overshoot）＋ 閃色後回落翡翠綠
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
    // 浮動跳字
    seq.current += 1;
    const id = seq.current;
    setDelta({ amount: diff, id });
    const t = window.setTimeout(() => {
      setDelta((d) => (d && d.id === id ? null : d));
    }, 1000);
    return () => window.clearTimeout(t);
  }, [value, spring, animate, scope]);

  return (
    <span className="relative inline-flex justify-center">
      <motion.span ref={scope} className={className}>
        {text}
      </motion.span>
      <AnimatePresence>
        {delta && (
          <motion.span
            key={delta.id}
            className="pointer-events-none absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 whitespace-nowrap text-sm font-extrabold tabular-nums"
            style={{
              color: delta.amount > 0 ? "#10b981" : "#ef4444",
              textShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }}
            initial={{ y: 6, opacity: 0, scale: 0.7 }}
            animate={{ y: -10, opacity: 1, scale: 1 }}
            exit={{ y: -22, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {delta.amount > 0 ? "+" : "−"}$
            {Math.abs(delta.amount).toLocaleString()}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
