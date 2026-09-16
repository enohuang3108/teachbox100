"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Switch } from "@/components/atoms/shadcn/switch";
import { StepSetup } from "@/components/organisms/StepSetup";
import { MAX_ENTRIES, parseEntries, validateEntries } from "@/lib/gacha/game";
import { useGachaStore } from "@/lib/gacha/store";
import { ListOrdered, SlidersHorizontal } from "lucide-react";

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { text, setText, restoreStarter, putBack, setPutBack } =
    useGachaStore();
  const entries = parseEntries(text);
  const error = validateEntries(entries);

  return (
    <StepSetup
      title="扭蛋機設定"
      blocker={error}
      startLabel="開始"
      onStart={onStart}
      steps={[
        {
          key: "entries",
          label: "名單",
          icon: ListOrdered,
          summary: `${entries.length} 顆扭蛋`,
          done: !error,
          content: (
            <section className="space-y-5">
              <header className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-h3 text-ink">扭蛋裡要放什麼？</h3>
                  <DialogDescription className="mt-1">
                    一行一顆：學生姓名、座號、題號、獎品都可以。點一顆扭蛋就打開揭曉。
                  </DialogDescription>
                </div>
                <span className="shrink-0 text-caption text-muted-foreground">
                  {entries.length}／{MAX_ENTRIES}
                </span>
              </header>
              <textarea
                aria-label="名單，一行一個"
                value={text}
                rows={12}
                spellCheck={false}
                placeholder={"小明\n小華\n小美"}
                onChange={(e) => setText(e.target.value)}
                className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-base leading-[1.75] text-ink placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={restoreStarter}
                className="text-muted-foreground hover:text-ink"
              >
                恢復預設名單
              </Button>
            </section>
          ),
        },
        {
          key: "rules",
          label: "玩法",
          icon: SlidersHorizontal,
          summary: putBack ? "抽完放回箱子" : "抽完收起來",
          content: (
            <section className="space-y-5">
              <header>
                <h3 className="text-h3 text-ink">抽到的扭蛋要放回箱子嗎？</h3>
                <DialogDescription className="mt-1">
                  點名、分組通常收起來；抽獎品、選題目可以放回去讓它再被抽到。
                </DialogDescription>
              </header>
              <label
                htmlFor="gacha-put-back"
                className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3.5"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    抽完放回箱子
                  </span>
                  <span className="mt-0.5 block text-caption text-muted-foreground">
                    揭曉後扭蛋回到箱子裡，還會再被抽到；關掉就記進抽籤紀錄、不再出現。
                  </span>
                </span>
                <Switch
                  id="gacha-put-back"
                  checked={putBack}
                  onCheckedChange={setPutBack}
                  className="mt-0.5"
                />
              </label>
            </section>
          ),
        },
      ]}
    />
  );
}
