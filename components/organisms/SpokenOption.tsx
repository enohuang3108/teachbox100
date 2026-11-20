"use client";

import { Volume2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 包住一顆答案鈕；有朗讀時右上角多一顆喇叭，按了唸這個選項。 */
export function SpokenOption({
  option,
  speak,
  disabled,
  className,
  children,
}: {
  option: string;
  speak: ((text: string) => void) | null;
  disabled?: boolean;
  /** 喇叭的尺寸與位置，例如大字版面放大 */
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative grid">
      {children}
      {speak && (
        <button
          type="button"
          aria-label={`唸選項「${option}」`}
          disabled={disabled}
          onClick={() => speak(option)}
          // 不設 z-index：排在答案鈕後面就蓋得住它，答對答錯的特效（z-10）才蓋得住喇叭
          className={cn(
            "absolute -top-2 -right-2 flex size-9 items-center justify-center rounded-full border border-border bg-card text-ink shadow-sm transition-[transform,opacity] duration-press ease-out active:scale-[0.97] disabled:opacity-50",
            className,
          )}
        >
          <Volume2 aria-hidden className="size-[55%]" />
        </button>
      )}
    </div>
  );
}
