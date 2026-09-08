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
          className="relative rounded-full transition-transform duration-150 ease-out hover:-translate-y-[2px] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1"
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
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-[background-color,border-color,transform] duration-150 ease-out ${
                  selected
                    ? "border-ink bg-sand"
                    : "border-transparent hover:bg-paper-warm"
                } ${taken ? "cursor-not-allowed opacity-30" : "active:scale-[0.97]"}`}
              >
                <img
                  src={c.src}
                  alt={c.label}
                  draggable={false}
                  className="h-20 w-20 object-contain"
                />
                <span className="w-full truncate text-center text-sm font-semibold leading-tight text-ink-soft">
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
