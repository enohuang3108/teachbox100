"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { useSound } from "@/lib/hooks/useSound";
import { useAudioStore } from "@/lib/monopoly/audio";
import type { PendingAction, Player, Question } from "@/lib/monopoly/types";
import { ANSWER_CONTENT, ANSWER_GRID, answerTextClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { useQuestionReading } from "@/lib/questions/speech";
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
  // 跳出題目先唸，唸完才開放作答
  // 大富翁沒有頂列靜音，音效拉到 0 就當靜音
  const muted = useAudioStore((s) => s.sfxVolume === 0);
  const reading = useQuestionReading(open ? question : null, question.text, !muted);
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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto" hideClose>
        {/* 和題目一起捲動，長答案也不會把玩家頭像推到畫面外。 */}
        <div className="mx-auto">
          <SpotlightAvatar player={player} name nameClassName="max-w-[16rem] text-h3 text-ink ![text-shadow:none]" />
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold text-ink-soft">
            {title}
          </DialogTitle>
        </DialogHeader>

        <p className="zhuyin-text text-lg leading-[1.75] text-ink">{question.text}</p>

        <fieldset disabled={reading} className={cn("m-0 min-w-0 border-0 p-0 transition-opacity duration-hover", reading && "opacity-50")}>
        {revealed === null && question.type === "choice" && (
          <div className={cn(ANSWER_GRID, "grid-cols-2 gap-2 max-sm:grid-cols-1")}>
            {question.options?.map((opt) => (
              <Button
                key={opt}
                variant="outline"
                className={cn(ANSWER_CONTENT, answerTextClass(opt), "min-h-14 rounded-2xl px-4 py-3 transition-transform duration-press ease-out active:scale-[0.97]")}
                onClick={() => pickChoice(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
        )}

        {revealed === null && question.type === "boolean" && (
          <div className={cn(ANSWER_GRID, "grid-cols-2 gap-2")}>
            <Button
              className={cn(ANSWER_CONTENT, answerTextClass("是"), "min-h-14 rounded-2xl px-4 py-3 transition-transform duration-press ease-out active:scale-[0.97]")}
              variant="outline"
              onClick={() => pickChoice("是")}
            >
              是
            </Button>
            <Button
              className={cn(ANSWER_CONTENT, answerTextClass("否"), "min-h-14 rounded-2xl px-4 py-3 transition-transform duration-press ease-out active:scale-[0.97]")}
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
            <div className={cn(ANSWER_GRID, "grid-cols-2 gap-2")}>
              <Button
                className={`flex-1 ${"h-auto min-w-14 max-w-full whitespace-normal break-words rounded-2xl px-4 py-3 text-base font-semibold transition-transform duration-press ease-out active:scale-[0.97]"}`}
                onClick={() => judge(true)}
              >
                學生答對
              </Button>
              <Button
                className={`flex-1 ${"h-auto min-w-14 max-w-full whitespace-normal break-words rounded-2xl px-4 py-3 text-base font-semibold transition-transform duration-press ease-out active:scale-[0.97]"}`}
                variant="destructive"
                onClick={() => judge(false)}
              >
                學生答錯
              </Button>
            </div>
          </div>
        )}

        </fieldset>

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
              className={`w-full ${"h-auto min-w-14 max-w-full whitespace-normal break-words rounded-2xl px-4 py-3 text-base font-semibold transition-transform duration-press ease-out active:scale-[0.97]"}`}
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
