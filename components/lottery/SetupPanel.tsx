"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { Switch } from "@/components/atoms/shadcn/switch";
import { MAX_ENTRIES, parseEntries, validateEntries } from "@/lib/lottery/game";
import { useLotteryStore } from "@/lib/lottery/store";

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { text, setText, autoClose, setAutoClose, restoreStarter } = useLotteryStore();
  const entries = parseEntries(text);
  const error = validateEntries(entries);

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-ink font-semibold">名單，一行一個</span>
        <textarea
          value={text}
          rows={10}
          spellCheck={false}
          placeholder={"小明\n小華\n小美"}
          onChange={(e) => setText(e.target.value)}
          className="bg-paper border-input text-ink placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-y rounded-2xl border px-4 py-3 text-base leading-[1.75] focus-visible:ring-2 focus-visible:outline-none"
        />
        <span className="text-muted-foreground flex items-center justify-between text-sm">
          <span>
            {entries.length} / {MAX_ENTRIES} 個
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={restoreStarter}
            className="text-muted-foreground hover:text-ink"
          >
            恢復預設名單
          </Button>
        </span>
      </label>

      <div className="bg-paper-warm border-ink/10 flex flex-col gap-4 rounded-2xl border p-4">
        <label htmlFor="lottery-autoclose" className="flex items-center justify-between gap-4">
          <span>
            <span className="text-ink block font-semibold">抽到一顆就關蓋</span>
            <span className="text-muted-foreground text-sm">
              關掉的話蓋子會一直開著，球一顆接一顆出來，再點一下才關
            </span>
          </span>
          <Switch id="lottery-autoclose" checked={autoClose} onCheckedChange={setAutoClose} />
        </label>
      </div>

      {error && <p className="text-brand-red text-sm font-medium">{error}</p>}
      <Button size="lg" disabled={!!error} onClick={onStart}>
        開始
      </Button>
    </div>
  );
}
