"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { MAX_ENTRIES, parseEntries, validateEntries } from "@/lib/lottery/game";
import { useLotteryStore } from "@/lib/lottery/store";

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { text, setText, restoreStarter } = useLotteryStore();
  const entries = parseEntries(text);
  const error = validateEntries(entries);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <section className="border-ink/10 bg-paper-warm/70 overflow-hidden rounded-2xl border shadow-[0_12px_32px_-24px_rgb(2_13_21/0.45)]">
        <label className="flex flex-col">
          <span className="border-ink/10 flex items-baseline justify-between gap-3 border-b px-5 py-4">
            <span className="font-display text-ink text-xl font-extrabold">名單，一行一個</span>
            <span className="text-ink-soft text-sm font-bold tabular-nums">
              {entries.length} / {MAX_ENTRIES} 個
            </span>
          </span>
          <textarea
            value={text}
            rows={10}
            spellCheck={false}
            placeholder={"小明\n小華\n小美"}
            onChange={(e) => setText(e.target.value)}
            className="bg-paper text-ink placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-y border-0 px-5 py-4 text-lg leading-[1.75] font-bold focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
          />
        </label>
        <div className="border-ink/15 flex flex-wrap items-center justify-between gap-2 border-t border-dashed px-5 py-3">
          <p className="text-ink-soft text-sm leading-[1.75]">點一顆球 → 打開揭曉；放回去的球會回到箱中。</p>
          <Button variant="ghost" size="sm" onClick={restoreStarter} className="text-ink-soft hover:text-ink">
            恢復預設名單
          </Button>
        </div>
      </section>

      {error && <p className="text-brand-red text-sm font-medium">{error}</p>}
      <Button size="lg" className="min-w-32 self-center" disabled={!!error} onClick={onStart}>
        開始
      </Button>
    </div>
  );
}
