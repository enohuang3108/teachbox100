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
import { motion } from "motion/react";
import { useState } from "react";
import { PlayerAvatar } from "./Avatar";

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
    pending?.kind === "buyQuestion" || pending?.kind === "buildQuestion";
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
      <DialogContent className="overflow-visible" hideClose>
        {/* 浮在 dialog 上緣外側：玩家頭像 ＋ 名稱 ＋ 光暈（沿用過場聚光燈風格） */}
        <div className="absolute bottom-full left-1/2 mb-4 flex -translate-x-1/2 flex-col items-center gap-1.5">
          <div className="relative flex items-center justify-center">
            <motion.span
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 240,
                height: 240,
                background: `radial-gradient(circle, ${player.color}99 0%, ${player.color}33 40%, ${player.color}00 70%)`,
                filter: "blur(6px)",
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.85, 1.08, 1], opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.04 }}
            />
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 16,
                delay: 0.06,
              }}
            >
              <PlayerAvatar
                character={player.character}
                color={player.color}
                size={96}
                ringWidth={5}
              />
            </motion.div>
          </div>
          <div
            className="max-w-[10rem] truncate text-base font-bold text-white/90"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {player.name}
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold text-stone-600">
            {pending?.kind === "buyQuestion" ? "答對才能購買" : "答對才能蓋房"}
          </DialogTitle>
        </DialogHeader>

        <p className="text-lg">{question.text}</p>

        {revealed === null && question.type === "choice" && (
          <div className="grid gap-2">
            {question.options?.map((opt) => (
              <Button
                key={opt}
                variant="outline"
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
            <p className="rounded bg-muted p-2 text-sm">
              參考答案：{question.answer}
            </p>
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
