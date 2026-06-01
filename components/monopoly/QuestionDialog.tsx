"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { useSound } from "@/lib/hooks/useSound";
import type { PendingAction, Question } from "@/lib/monopoly/types";
import { useState } from "react";

export function QuestionDialog({
  pending,
  question,
  onAnswered,
}: {
  pending: PendingAction;
  question: Question;
  onAnswered: (correct: boolean) => void;
}) {
  const { playCorrectSound, playWrongSound } = useSound();
  const [revealed, setRevealed] = useState<boolean | null>(null);

  const open = pending?.kind === "buyQuestion" || pending?.kind === "buildQuestion";
  if (!open) return null;

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {pending?.kind === "buyQuestion" ? "答對才能購買" : "答對才能蓋房"}
          </DialogTitle>
        </DialogHeader>

        <p className="text-lg">{question.text}</p>

        {revealed === null && question.type === "choice" && (
          <div className="grid gap-2">
            {question.options?.map((opt) => (
              <Button key={opt} variant="outline" onClick={() => pickChoice(opt)}>
                {opt}
              </Button>
            ))}
          </div>
        )}

        {revealed === null && question.type === "boolean" && (
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => pickChoice("是")}
            >
              是
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => pickChoice("否")}
            >
              否
            </Button>
          </div>
        )}

        {revealed === null && question.type === "short" && (
          <div className="space-y-3">
            <p className="rounded bg-muted p-2 text-sm">參考答案：{question.answer}</p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => judge(true)}>
                學生答對
              </Button>
              <Button
                className="flex-1"
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
            <p className={revealed ? "text-green-600" : "text-red-600"}>
              {revealed ? "答對了！" : "答錯了"}
            </p>
            {question.explanation && (
              <p className="rounded bg-muted p-2 text-sm">
                解析：{question.explanation}
              </p>
            )}
            <Button className="w-full" onClick={() => onAnswered(revealed)}>
              確定
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
