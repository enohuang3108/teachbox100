"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { useSound } from "@/lib/hooks/useSound";
import type { PendingAction, Player, Question } from "@/lib/monopoly/types";
import { useState } from "react";
import { SpotlightAvatar } from "./SpotlightAvatar";

export function QuestionDialog({
  pending,
  question,
  player,
  onAnswered,
}: {
  pending: PendingAction;
  question: Question;
  player: Player;
  onAnswered: (correct: boolean) => void;
}) {
  const { playCorrectSound, playWrongSound } = useSound();
  const [revealed, setRevealed] = useState<boolean | null>(null);

  const open =
    pending?.kind === "buyQuestion" ||
    pending?.kind === "buildQuestion" ||
    pending?.kind === "cardQuiz" ||
    pending?.kind === "passStartQuestion";
  if (!open) return null;

  // 標題：買地／蓋房用固定字樣；過起點加碼題標出答對／答錯獎金；互動答題卡顯示卡片描述
  const title =
    pending.kind === "buyQuestion"
      ? "答對才能購買"
      : pending.kind === "buildQuestion"
        ? "答對才能蓋房"
        : pending.kind === "passStartQuestion"
          ? `經過起點加碼題！答對 +$${pending.rewardRight.toLocaleString()}、答錯 +$${pending.rewardWrong.toLocaleString()}`
          : pending.card.text;

  function judge(correct: boolean) {
    setRevealed(correct);
    if (correct) playCorrectSound();
    else playWrongSound();
  }

  function pickChoice(opt: string) {
    judge(opt === question.answer);
  }

  return (
    <Dialog open={open}>
      <DialogContent className="overflow-visible" hideClose>
        {/* 浮在 dialog 上緣外側：玩家頭像 ＋ 名稱 ＋ 光暈（沿用過場聚光燈風格） */}
        <div className="absolute bottom-full left-1/2 mb-4 -translate-x-1/2">
          <SpotlightAvatar
            player={player}
            haloSize={240}
            name
            nameClassName="max-w-[10rem] text-base font-bold text-paper/90"
          />
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold text-ink-soft">
            {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-lg leading-[1.75] text-ink">{question.text}</p>

        {revealed === null && question.type === "choice" && (
          <div className="grid gap-2">
            {question.options?.map((opt) => (
              <Button
                key={opt}
                variant="outline"
                className={
                  "h-auto rounded-full py-3 text-base font-semibold transition-transform duration-150 ease-out active:scale-[0.97]"
                }
                onClick={() => pickChoice(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
        )}

        {revealed === null && question.type === "boolean" && (
          <div className="flex gap-2">
            <Button
              className={`flex-1 ${"h-auto rounded-full py-3 text-base font-semibold transition-transform duration-150 ease-out active:scale-[0.97]"}`}
              variant="outline"
              onClick={() => pickChoice("是")}
            >
              是
            </Button>
            <Button
              className={`flex-1 ${"h-auto rounded-full py-3 text-base font-semibold transition-transform duration-150 ease-out active:scale-[0.97]"}`}
              variant="outline"
              onClick={() => pickChoice("否")}
            >
              否
            </Button>
          </div>
        )}

        {revealed === null && question.type === "short" && (
          <div className="space-y-3">
            {/* 判定前不亮答案：投影出去時學生會直接看到。解析等判完才出現 */}
            <div className="flex gap-2">
              <Button
                className={`flex-1 ${"h-auto rounded-full py-3 text-base font-semibold transition-transform duration-150 ease-out active:scale-[0.97]"}`}
                onClick={() => judge(true)}
              >
                學生答對
              </Button>
              <Button
                className={`flex-1 ${"h-auto rounded-full py-3 text-base font-semibold transition-transform duration-150 ease-out active:scale-[0.97]"}`}
                variant="destructive"
                onClick={() => judge(false)}
              >
                學生答錯
              </Button>
            </div>
          </div>
        )}

        {revealed !== null && (
          <div className="space-y-3">
            <p
              className={`font-bold ${revealed ? "text-brand-green" : "text-brand-red"}`}
            >
              {revealed ? "答對了！" : "答錯了"}
            </p>
            {(question.explanation ?? question.type === "short") && (
              <p className="rounded-xl bg-sand p-3 text-sm leading-[1.75] text-ink-soft">
                解析：{question.explanation ?? question.answer}
              </p>
            )}
            <Button
              className={`w-full ${"h-auto rounded-full py-3 text-base font-semibold transition-transform duration-150 ease-out active:scale-[0.97]"}`}
              onClick={() => onAnswered(revealed)}
            >
              確定
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
