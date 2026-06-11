"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";
import { CHARACTERS, characterById } from "@/lib/monopoly/characters";
import { useState } from "react";
import { PlayerAvatar } from "./Avatar";

// 點擊頭像即可開啟角色選單；其他玩家已選的角色會被停用，確保彼此不撞臉。
export function CharacterPicker({
  value,
  color,
  takenByOthers,
  onSelect,
}: {
  value: string;
  color: string;
  takenByOthers: string[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = characterById(value);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="點擊更換角色"
          className="relative rounded-full transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        >
          <PlayerAvatar character={value} color={color} size={40} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            選擇角色 — 目前是{current.label}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {CHARACTERS.map((c) => {
            const taken = c.id !== value && takenByOthers.includes(c.id);
            const selected = c.id === value;
            return (
              <button
                key={c.id}
                type="button"
                disabled={taken}
                onClick={() => {
                  onSelect(c.id);
                  setOpen(false);
                }}
                title={taken ? `${c.label}（已被選走）` : c.label}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition ${
                  selected
                    ? "border-zinc-800 bg-zinc-100"
                    : "border-transparent hover:bg-zinc-50"
                } ${taken ? "cursor-not-allowed opacity-30" : ""}`}
              >
                <img
                  src={c.src}
                  alt={c.label}
                  draggable={false}
                  className="h-20 w-20 object-contain"
                />
                <span className="w-full truncate text-center text-sm font-medium leading-tight text-zinc-600">
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
