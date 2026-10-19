"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { DialogTitle } from "@/components/atoms/shadcn/dialog";
import { cn } from "@/lib/utils";
import { ShareDialog, type ShareConfig } from "./ShareDialog";
import { Check, Share2, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { Switch } from "@/components/atoms/shadcn/switch";
import { loadZhuyinFont, useZhuyinPreferences } from "@/lib/zhuyin";

const PRESS =
  "transition-transform duration-press ease-out active:scale-[0.97]";

export interface SetupStep {
  key: string;
  label: string;
  icon: LucideIcon;
  /** 側欄與底列用的一句話：目前設了什麼 */
  summary: string;
  /** true 時側欄打勾；沒有「完成」概念的站（規則、玩法）不給 */
  done?: boolean;
  /** 這一站的內容，自己帶標題（h3 ＋ DialogDescription） */
  content: React.ReactNode;
}

/**
 * 開始前的設定旅程，放在 DialogContent 裡用（`max-w-4xl gap-0 overflow-hidden p-0`）。
 * 左側步驟側欄隨時可跳、每站底下寫目前設定；右側捲動內容；底部固定列左邊一句總結，
 * 右邊上一步／下一步，最後一站才是開始。blocker 有值時總結換成紅字原因並擋住開始；
 * 空字串只擋不講 —— 老師還沒動手（例如還沒選檔）時，先別對他亮紅字。
 */
export function StepSetup({
  title,
  steps,
  blocker,
  startLabel,
  onStart,
  share,
  offerZhuyin = false,
  zhuyinStepKey,
  zhuyinPosition = "before",
}: {
  title: string;
  steps: SetupStep[];
  blocker?: string | null;
  startLabel: string;
  onStart: () => void;
  /** 給了就在最後一步的開始鈕左邊放「分享設定」；設定還沒填完（有 blocker）不能分享 */
  share?: ShareConfig;
  /** 有題目或選項可以標注音才開；注音只套在 `.zhuyin-text`，沒有題目的單元給了開關也沒效果 */
  offerZhuyin?: boolean;
  /** 指定注音開關所屬步驟（給了就等於開啟注音）；未指定時每站都顯示。 */
  zhuyinStepKey?: string;
  /** 注音開關放在該步驟內容前方或後方。 */
  zhuyinPosition?: "before" | "after";
}) {
  const [stepKey, setStepKey] = useState(steps[0].key);
  const [shareOpen, setShareOpen] = useState(false);
  const path = usePathname();
  const zhuyin = useZhuyinPreferences((state) => state.units[path] ?? false);
  const setZhuyin = useZhuyinPreferences((state) => state.setEnabled);
  const [fontLoading, setFontLoading] = useState(false);
  const [fontError, setFontError] = useState(false);
  const zhuyinId = useId();
  const index = Math.max(
    0,
    steps.findIndex((s) => s.key === stepKey),
  );
  const blocked = blocker != null;
  const current = steps[index];
  const isLast = index === steps.length - 1;
  const zhuyinControl = (zhuyinStepKey ? current.key === zhuyinStepKey : offerZhuyin) ? (
    <div className={zhuyinPosition === "after" ? "mt-6" : "mb-6"}>
      <label htmlFor={zhuyinId} className="flex cursor-pointer items-center justify-between gap-4">
        <span className="text-sm font-semibold text-ink">顯示注音</span>
        <Switch
          id={zhuyinId}
          aria-label="顯示注音"
          aria-busy={fontLoading}
          checked={zhuyin}
          disabled={fontLoading}
          onCheckedChange={async (enabled) => {
            setFontError(false);
            if (!enabled) { setZhuyin(path, false); return; }
            setFontLoading(true);
            try {
              await loadZhuyinFont();
              setZhuyin(path, true);
            } catch {
              setFontError(true);
            } finally {
              setFontLoading(false);
            }
          }}
        />
      </label>
      {fontError && <p role="alert" className="mt-2 text-caption text-danger-ink">注音字型載入失敗，請確認網路後再試一次。</p>}
    </div>
  ) : null;

  return (
    <div className="grid h-[min(680px,90dvh)] grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] md:grid-cols-[232px_minmax(0,1fr)] md:grid-rows-1">
      <nav
        aria-label="設定步驟"
        className="flex gap-1 border-b border-border bg-muted/60 p-3 pr-12 md:flex-col md:border-r md:border-b-0 md:p-4 md:pr-4"
      >
        <DialogTitle className="sr-only font-display text-h3 text-ink md:not-sr-only md:mb-4 md:px-2 md:pt-1">
          {title}
        </DialogTitle>
        {steps.map((s, i) => {
          const on = i === index;
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              type="button"
              aria-current={on ? "step" : undefined}
              onClick={() => setStepKey(s.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2 text-left whitespace-nowrap transition-[background-color,transform] duration-hover ease-out active:scale-[0.97] md:flex-none md:justify-start md:gap-3 md:px-3 md:py-2.5",
                on ? "bg-secondary" : "hover:bg-secondary/50",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg md:size-8",
                  on
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <span className="hidden text-muted-foreground md:inline">
                    {i + 1}
                  </span>
                  {s.label}
                  {s.done && (
                    <Check
                      className="hidden size-3.5 text-success md:block"
                      aria-label="已完成"
                    />
                  )}
                </span>
                <span className="hidden truncate text-caption text-muted-foreground md:block">
                  {s.summary}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[1fr_auto]">
        <div
          key={current.key}
          className="min-h-0 overflow-y-auto px-5 py-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 motion-reduce:slide-in-from-bottom-0 md:px-8"
        >
          {zhuyinPosition === "before" && zhuyinControl}
          {current.content}
          {zhuyinPosition === "after" && zhuyinControl}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-5 py-3 md:px-8">
          <p className="min-w-0 truncate text-caption text-muted-foreground">
            {blocker ? (
              <span className="text-danger-ink">{blocker}</span>
            ) : (
              steps.map((s) => s.summary).join("・")
            )}
          </p>
          <div className="ml-auto flex gap-2">
            {isLast && share && (
              <Button
                variant="ghost"
                className={cn("rounded-full", PRESS)}
                disabled={blocked}
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="size-4" aria-hidden />
                分享設定
              </Button>
            )}
            {index > 0 && (
              <Button
                variant="ghost"
                className={cn("rounded-full", PRESS)}
                onClick={() => setStepKey(steps[index - 1].key)}
              >
                上一步
              </Button>
            )}
            {isLast ? (
              <Button
                className={cn("rounded-full px-6 font-bold", PRESS)}
                disabled={blocked || fontLoading}
                onClick={onStart}
              >
                {startLabel}
              </Button>
            ) : (
              <Button
                className={cn("rounded-full px-6 font-bold", PRESS)}
                onClick={() => setStepKey(steps[index + 1].key)}
              >
                下一步
              </Button>
            )}
          </div>
        </footer>
      </div>
      {shareOpen && share && (
        <ShareDialog share={share} onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
}
