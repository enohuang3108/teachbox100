"use client";

import { pages } from "@/app/pages.config";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";
import { usePathname } from "next/navigation";

// 意見板本體由 Featurebase 託管，這裡只是一層外框
const BOARD_URL = "https://teachbox100.featurebase.app";

// 跟 FaviconButton 同一套規則：全螢幕遊戲與教材頁的版面已經滿了，不再塞按鈕
const HIDDEN_PREFIXES = ["/monopoly"];
const UNIT_PATHS = new Set(Object.values(pages).map((p) => p.path));

export const FeedbackButton = () => {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;
  if (pathname && UNIT_PATHS.has(pathname)) return null;

  return (
    <Dialog>
      <DialogTrigger className="fixed top-4 right-4 z-40 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-paper transition-transform duration-150 ease-out active:scale-[0.97]">
        老師意見箱
      </DialogTrigger>
      {/* p-0 + flex：讓 iframe 吃滿對話框，只留標題列 */}
      <DialogContent className="flex h-[80dvh] max-w-3xl flex-col gap-0 overflow-hidden bg-paper-warm p-0">
        <DialogTitle className="shrink-0 border-b border-ink/10 px-5 py-3.5 text-base font-bold text-ink">
          老師意見箱
        </DialogTitle>
        <iframe
          src={BOARD_URL}
          title="老師意見箱"
          className="w-full flex-1 border-0"
          loading="lazy"
        />
      </DialogContent>
    </Dialog>
  );
};
