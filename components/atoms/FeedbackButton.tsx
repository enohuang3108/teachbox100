"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";

// 意見板本體由 Featurebase 託管，這裡只是一層外框
const BOARD_URL = "https://teachbox100.featurebase.app";

// 位置、顯示條件、按鈕文字都交給呼叫端決定，這裡只管開關對話框
export const FeedbackButton = ({
  className,
  label = "使用回饋",
}: {
  className: string;
  label?: React.ReactNode;
}) => (
  <Dialog>
    <DialogTrigger className={className}>{label}</DialogTrigger>
    {/* p-0 + flex：讓 iframe 吃滿對話框，只留標題列 */}
    <DialogContent className="bg-paper-warm flex h-[80dvh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
      <DialogTitle className="border-ink/10 text-ink shrink-0 border-b px-5 py-3.5 text-base font-bold">
        使用回饋
      </DialogTitle>
      <iframe
        src={BOARD_URL}
        title="使用回饋"
        className="w-full flex-1 border-0"
        loading="lazy"
      />
    </DialogContent>
  </Dialog>
);
