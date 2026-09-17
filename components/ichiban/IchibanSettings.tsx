"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/shadcn/select";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { StepSetup } from "@/components/organisms/StepSetup";
import {
  defaultIchibanPrizes,
  ICHIBAN_RANKS as RANKS,
  prizeTotal,
  type IchibanPrize,
} from "@/lib/ichiban/prizes";
import { Gift, Plus, Trash2 } from "lucide-react";
import { useIchibanStore } from "@/lib/ichiban/store";
import { useState } from "react";

const copy = (prizes: IchibanPrize[]) => prizes.map((prize) => ({ ...prize }));

/**
 * 開始前的獎項設定，放在 DialogContent 裡。改的是草稿，按開始才寫進 store ——
 * 寫進去等於換一套籤，已抽張數歸零、卡池重洗。
 */
export function IchibanSettings({ onStart }: { onStart: () => void }) {
  const prizes = useIchibanStore((state) => state.prizes);
  const setPrizes = useIchibanStore((state) => state.setPrizes);
  // 對話框每次打開都重新掛載，初始值就是 store 裡最新的獎項
  const [draft, setDraft] = useState(() => copy(prizes));
  const incomplete = draft.some(
    (prize) => !prize.rank.trim() || !prize.name.trim() || prize.quantity < 1,
  );
  const total = prizeTotal(draft);

  const update = (
    index: number,
    field: keyof IchibanPrize,
    value: string | number,
  ) => {
    setDraft((current) =>
      current.map((prize, prizeIndex) =>
        prizeIndex === index ? { ...prize, [field]: value } : prize,
      ),
    );
  };

  return (
    <StepSetup
      title="一番賞設定"
      blocker={incomplete ? "每個獎項都要有內容，數量至少 1" : null}
      startLabel="開始"
      onStart={() => {
        setPrizes(draft);
        onStart();
      }}
      steps={[
        {
          key: "prizes",
          label: "獎項",
          icon: Gift,
          summary: `${draft.length} 種・${total} 張籤`,
          done: !incomplete,
          content: (
            <section className="space-y-4">
              <header>
                <h3 className="text-h3 text-ink">有哪些獎、各幾張？</h3>
                <DialogDescription className="mt-1">
                  共 {draft.length} 種獎項，合計 {total}{" "}
                  張籤。按開始會重新洗牌，已抽的張數歸零。
                </DialogDescription>
              </header>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">獎項清單</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDraft(defaultIchibanPrizes())}
                >
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
                      <span className="sm:sr-only">
                        第 {index + 1} 張籤的獎項
                      </span>
                      <Select
                        value={prize.rank}
                        onValueChange={(value) => update(index, "rank", value)}
                      >
                        <SelectTrigger
                          aria-label={`第 ${index + 1} 張籤的獎項`}
                          className="rounded-lg border-ink/10 bg-paper font-bold sm:border-transparent sm:bg-transparent sm:px-2"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RANKS.map((rank) => (
                            <SelectItem key={rank} value={rank}>
                              {rank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-ink sm:block">
                      <span className="sm:sr-only">
                        第 {index + 1} 張籤的內容
                      </span>
                      <input
                        value={prize.name}
                        onChange={(event) =>
                          update(index, "name", event.target.value)
                        }
                        aria-label={`第 ${index + 1} 張籤的內容`}
                        className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 font-bold outline-none transition-colors focus-visible:border-ink/30 focus-visible:ring-2 focus-visible:ring-ring sm:border-transparent sm:bg-transparent sm:px-2"
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-ink sm:block">
                      <span className="sm:sr-only">
                        第 {index + 1} 張籤的數量
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={prize.quantity}
                        onChange={(event) =>
                          update(index, "quantity", Number(event.target.value))
                        }
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
                          current.filter(
                            (_, prizeIndex) => prizeIndex !== index,
                          ),
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
            </section>
          ),
        },
      ]}
    />
  );
}
