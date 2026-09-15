"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import {
  defaultIchibanPrizes,
  ICHIBAN_RANKS as RANKS,
  prizeTotal,
  type IchibanPrize,
} from "@/lib/ichiban/prizes";
import { Plus, Trash2 } from "lucide-react";
import { useIchibanStore } from "@/lib/ichiban/store";
import { useEffect, useState } from "react";

const copy = (prizes: IchibanPrize[]) => prizes.map((prize) => ({ ...prize }));

export function IchibanSettings({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const prizes = useIchibanStore((state) => state.prizes);
  const setPrizes = useIchibanStore((state) => state.setPrizes);
  const [draft, setDraft] = useState(() => copy(prizes));
  const incomplete = draft.some(
    (prize) => !prize.rank.trim() || !prize.name.trim() || prize.quantity < 1,
  );
  const total = prizeTotal(draft);

  useEffect(() => {
    if (open) setDraft(copy(prizes));
  }, [open, prizes]);

  const update = (index: number, field: keyof IchibanPrize, value: string | number) => {
    setDraft((current) =>
      current.map((prize, prizeIndex) =>
        prizeIndex === index ? { ...prize, [field]: value } : prize,
      ),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(88svh,780px)] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-ink/10 border-b px-6 py-5 text-left">
          <DialogTitle>一番賞設定</DialogTitle>
          <DialogDescription>
            共 {draft.length} 種獎項，合計 {total} 張籤
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-ink font-display text-lg font-extrabold">獎項清單</h3>
            <Button variant="ghost" size="sm" onClick={() => setDraft(defaultIchibanPrizes())}>
              恢復預設
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-ink/10">
            <div className="text-ink-soft hidden grid-cols-[2rem_7rem_minmax(0,1fr)_5rem_2.5rem] gap-3 border-b border-ink/10 bg-paper-warm px-4 py-2 text-xs font-bold sm:grid">
              <span>#</span>
              <span>獎項</span>
              <span>內容</span>
              <span>數量</span>
              <span className="sr-only">操作</span>
            </div>
            {draft.map((prize, index) => (
              <div
                key={index}
                className="grid gap-2 border-b border-dashed border-ink/15 px-4 py-3 last:border-b-0 sm:grid-cols-[2rem_7rem_minmax(0,1fr)_5rem_2.5rem] sm:items-center sm:gap-3"
              >
                <span className="text-ink-soft hidden text-sm font-bold tabular-nums sm:block">
                  {index + 1}
                </span>
                <label className="grid gap-1 text-sm font-semibold text-ink sm:block">
                  <span className="sm:sr-only">第 {index + 1} 張籤的獎項</span>
                  <select
                    value={prize.rank}
                    onChange={(event) => update(index, "rank", event.target.value)}
                    aria-label={`第 ${index + 1} 張籤的獎項`}
                    className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 font-bold outline-none transition-colors focus-visible:border-ink/30 focus-visible:ring-2 focus-visible:ring-ring sm:border-transparent sm:bg-transparent sm:px-2"
                  >
                    {RANKS.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold text-ink sm:block">
                  <span className="sm:sr-only">第 {index + 1} 張籤的內容</span>
                  <input
                    value={prize.name}
                    onChange={(event) => update(index, "name", event.target.value)}
                    aria-label={`第 ${index + 1} 張籤的內容`}
                    className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 font-bold outline-none transition-colors focus-visible:border-ink/30 focus-visible:ring-2 focus-visible:ring-ring sm:border-transparent sm:bg-transparent sm:px-2"
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-ink sm:block">
                  <span className="sm:sr-only">第 {index + 1} 張籤的數量</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={prize.quantity}
                    onChange={(event) => update(index, "quantity", Number(event.target.value))}
                    aria-label={`第 ${index + 1} 張籤的數量`}
                    className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-right font-bold tabular-nums outline-none transition-colors focus-visible:border-ink/30 focus-visible:ring-2 focus-visible:ring-ring sm:border-transparent sm:bg-transparent sm:px-2"
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={draft.length === 1}
                  onClick={() =>
                    setDraft((current) =>
                      current.filter((_, prizeIndex) => prizeIndex !== index),
                    )
                  }
                  aria-label={`刪除第 ${index + 1} 張籤`}
                  className="justify-self-end text-ink-soft hover:text-brand-red"
                >
                  <Trash2 aria-hidden size={18} />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setDraft((current) => [
                ...current,
                {
                  rank: RANKS[Math.min(current.length, RANKS.length - 1)],
                  name: "新獎項內容",
                  quantity: 1,
                },
              ])
            }
            className="w-full border-dashed"
          >
            <Plus aria-hidden size={18} />
            新增獎項
          </Button>
        </div>
        <DialogFooter className="border-ink/10 gap-2 border-t bg-paper-warm/40 px-6 py-4 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            disabled={incomplete}
            onClick={() => {
              setPrizes(draft);
              onOpenChange(false);
            }}
          >
            儲存設定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
