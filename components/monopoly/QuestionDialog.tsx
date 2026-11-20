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
import { useOptionReading, useQuestionReading } from "@/lib/questions/speech";
import { SpokenOption } from "@/components/organisms/SpokenOption";
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
  const speak = useOptionReading(open && revealed === null ? question : null, !muted);
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
      {/* 外層透明、鋪滿整個畫面只負責捲動：頭像浮在暗場上（跟購買確認、抽卡同一套聚光燈），
          卡片只裝標題、題目與按鈕；兩者一起捲，長答案也不會把頭像推到畫面外。
          容器跟畫面一樣大，光暈才不會被捲動邊界裁掉；焦點在容器上，不畫外框 */}
      <DialogContent
        className="inset-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center-safe gap-5 overflow-y-auto border-0 bg-transparent px-4 py-10 shadow-none outline-none"
        hideClose
      >
        <SpotlightAvatar player={player} name />

        <div className="grid w-full max-w-lg gap-4 rounded-2xl bg-background p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold text-ink-soft">
            {title}
          </DialogTitle>
        </DialogHeader>

        <p className="zhuyin-text text-lg leading-[1.75] text-ink">{question.text}</p>

        <fieldset disabled={reading} className={cn("m-0 min-w-0 border-0 p-0 transition-opacity duration-hover", reading && "opacity-50")}>
        {revealed === null && question.type === "choice" && (
          <div className={cn(ANSWER_GRID, "grid-cols-2 gap-3 max-sm:grid-cols-1")}>
            {question.options?.map((opt) => (
              <SpokenOption key={opt} option={opt} speak={speak}>
                <Button
                  variant="outline"
                  className={cn(ANSWER_CONTENT, answerTextClass(opt), "min-h-14 rounded-2xl px-4 py-3 transition-transform duration-press ease-out active:scale-[0.97]")}
                  onClick={() => pickChoice(opt)}
                >
                  {opt}
                </Button>
              </SpokenOption>
            ))}
          </div>
        )}

        {revealed === null && question.type === "boolean" && (
          <div className={cn(ANSWER_GRID, "grid-cols-2 gap-3")}>
            <SpokenOption option="是" speak={speak}>
              <Button
                className={cn(ANSWER_CONTENT, answerTextClass("是"), "min-h-14 rounded-2xl px-4 py-3 transition-transform duration-press ease-out active:scale-[0.97]")}
                variant="outline"
                onClick={() => pickChoice("是")}
              >
                是
              </Button>
            </SpokenOption>
            <SpokenOption option="否" speak={speak}>
              <Button
                className={cn(ANSWER_CONTENT, answerTextClass("否"), "min-h-14 rounded-2xl px-4 py-3 transition-transform duration-press ease-out active:scale-[0.97]")}
                variant="outline"
                onClick={() => pickChoice("否")}
              >
                否
              </Button>
            </SpokenOption>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
