"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Switch } from "@/components/atoms/shadcn/switch";
import { StepSetup } from "@/components/organisms/StepSetup";
import { MAX_ENTRIES, parseEntries, validateEntries } from "@/lib/wheel/game";
import { useWheelStore } from "@/lib/wheel/store";
import { ListOrdered, SlidersHorizontal } from "lucide-react";

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { text, setText, removeOnPick, setRemoveOnPick, restoreStarter } =
    useWheelStore();
  const entries = parseEntries(text);
  const error = validateEntries(entries);

  return (
    <StepSetup
      title="轉盤設定"
      blocker={error}
      startLabel="開始"
      share={{ unit: "wheel", setup: { text, removeOnPick } }}
      onStart={onStart}
      steps={[
        {
          key: "entries",
          label: "名單",
          icon: ListOrdered,
          summary: `${entries.length} 個`,
          done: !error,
          content: (
            <section className="space-y-5">
              <header className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-h3 text-ink">轉盤上要有誰？</h3>
                  <DialogDescription className="mt-1">
                    一行一個：學生姓名、座號、題號、獎品都可以。
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
          summary: removeOnPick ? "抽過的拿掉" : "可以重複抽",
          content: (
            <section className="space-y-5">
              <header>
                <h3 className="text-h3 text-ink">抽到的人還要留在轉盤上嗎？</h3>
                <DialogDescription className="mt-1">
                  點名、分組通常拿掉；抽獎品、選題目可以重複。
                </DialogDescription>
              </header>
              <label
                htmlFor="wheel-remove"
                className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3.5"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    抽過的拿掉
                  </span>
                  <span className="mt-0.5 block text-caption text-muted-foreground">
                    抽到的人下一次轉之前從轉盤移除，直到按「全部放回」。
                  </span>
                </span>
                <Switch
                  id="wheel-remove"
                  checked={removeOnPick}
                  onCheckedChange={setRemoveOnPick}
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
