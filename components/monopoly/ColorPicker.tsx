"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/shadcn/popover";
import { PLAYER_COLORS } from "@/lib/monopoly/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

// 顏色顯示順序即 PLAYER_COLORS 的陣列順序，要調整排列請改 lib/monopoly/types.ts。
// 點色塊就地彈出調色盤（不開新對話框），其他玩家已選的顏色停用，避免代表色撞色。
export function ColorPicker({
  value,
  takenByOthers,
  onSelect,
}: {
  value: string;
  takenByOthers: string[];
  onSelect: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="更換顏色"
          className="h-7 w-7 shrink-0 rounded-full border-2 border-paper ring-1 ring-ink/15 transition-transform duration-press ease-out active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          style={{ backgroundColor: value }}
        />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={8}
        className="w-auto rounded-[1.5rem] border-border bg-card p-3 shadow-lg"
      >
        {/* 20 色排兩列，一列會超出對話框寬度 */}
        <div
          role="radiogroup"
          aria-label="代表色"
          className="grid grid-cols-10 gap-1.5"
        >
          {PLAYER_COLORS.map((color) => {
            const taken = color !== value && takenByOthers.includes(color);
            const selected = color === value;
            return (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={taken ? `${color}（已被選走）` : color}
                disabled={taken}
                onClick={() => {
                  onSelect(color);
                  setOpen(false);
                }}
                style={{ backgroundColor: color }}
                className={cn(
                  "relative flex size-7 items-center justify-center overflow-hidden rounded-full transition-transform duration-press ease-out",
                  taken
                    ? "cursor-not-allowed opacity-35"
                    : "hover:-translate-y-[2px] active:scale-[0.9]",
                )}
              >
                {selected && (
                  <Check className="size-4 text-paper" strokeWidth={3} />
                )}
                {taken && (
                  // 斜線禁用標記，由圓形 overflow 裁切
                  <span className="pointer-events-none absolute top-1/2 left-1/2 h-[2px] w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-paper/90" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
