"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { motion } from "motion/react";

export function Dice({
  lastRoll,
  disabled,
  onRoll,
}: {
  lastRoll: number[] | null;
  disabled: boolean;
  onRoll: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {(lastRoll ?? []).map((d, i) => (
          <motion.div
            key={`${i}-${d}`}
            initial={{ rotate: -90, scale: 0.6 }}
            animate={{ rotate: 0, scale: 1 }}
            className="flex h-12 w-12 items-center justify-center rounded-lg border-2 bg-white text-2xl font-bold shadow"
          >
            {d}
          </motion.div>
        ))}
      </div>
      <Button size="lg" disabled={disabled} onClick={onRoll}>
        擲骰子
      </Button>
    </div>
  );
}
