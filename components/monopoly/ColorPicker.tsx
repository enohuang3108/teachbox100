"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";
import { PLAYER_COLORS } from "@/lib/monopoly/types";
import { useState } from "react";

// 顏色顯示順序即 PLAYER_COLORS 的陣列順序，要調整排列請改 lib/monopoly/types.ts。
// 點擊色塊即可從 20 色中挑選；其他玩家已選的顏色會被停用，避免代表色撞色。
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="點擊更換顏色"
          aria-label="更換顏色"
          className="h-7 w-7 shrink-0 rounded-full border-2 border-white shadow ring-1 ring-zinc-300 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
          style={{ backgroundColor: value }}
        />
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>選擇代表色</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-3 py-2">
          {PLAYER_COLORS.map((color) => {
            const taken = color !== value && takenByOthers.includes(color);
            const selected = color === value;
            return (
              <button
                key={color}
                type="button"
                disabled={taken}
                onClick={() => {
                  onSelect(color);
                  setOpen(false);
                }}
                title={taken ? "已被選走" : color}
                style={{ backgroundColor: color }}
                className={`relative h-10 w-10 overflow-hidden rounded-full transition ${
                  selected
                    ? "ring-2 ring-zinc-900 ring-offset-2"
                    : "ring-1 ring-zinc-200"
                } ${
                  taken ? "cursor-not-allowed opacity-60" : "hover:scale-110"
                }`}
              >
                {taken && (
                  // 斜線禁用標記：旋轉一條跨對角的細線，由圓形 overflow 裁切
                  <span className="pointer-events-none absolute left-1/2 top-1/2 h-[2.5px] w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
