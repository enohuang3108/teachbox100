"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { getRandomConfettiEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
interface GameAnswerSectionProps {
  question: string;
  hasAnswer: boolean;
  isCorrect: boolean | null;
  correctFeedback: string;
  incorrectFeedback: string;
  showFeedback: boolean;
  submitMessage?: string;
  children: React.ReactNode;
  className?: string;
  checkAnswer: () => void;
  handleNextQuestion: () => void;
}

export default function GameAnswerSection({
  question,
  hasAnswer,
  isCorrect,
  correctFeedback,
  incorrectFeedback,
  showFeedback,
  submitMessage= "確定",
  children,
  className,
  checkAnswer,
  handleNextQuestion,
}: GameAnswerSectionProps) {
  const { playCorrectSound, playWrongSound } = useSound();

  useEffect(() => {
    if (isCorrect === null) return;
    if (isCorrect) {
      playCorrectSound();
      // 使用隨機撒花特效
      const randomEffect = getRandomConfettiEffect();
      randomEffect();
    } else {
      playWrongSound();
    }
  }, [isCorrect, playCorrectSound, playWrongSound]);

  return (
    <div className={cn("relative mt-16", className)}>
      <h2 className="mb-6 text-3xl font-bold md:text-4xl">{question}</h2>
      {children}
      {/* 提交按鈕 */}
      <div className="mt-6 md:mt-8">
        <Button
          onClick={checkAnswer}
          className="w-full rounded-full bg-black py-5 text-xl text-white hover:bg-gray-800 md:py-6 md:text-2xl"
          disabled={!hasAnswer || showFeedback}
        >
          {submitMessage}
        </Button>
      </div>

      {/* 回饋訊息 */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm transition-opacity duration-300 ${
          showFeedback ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`text-center ${
            isCorrect === null
              ? ""
              : isCorrect
                ? "text-green-700"
                : "text-red-700"
          }`}
        >
          <p className="mb-4 text-2xl font-bold md:text-3xl">
            {isCorrect === null
              ? "" // 不顯示文字直到狀態確定
              : isCorrect
                ? correctFeedback
                : incorrectFeedback}
          </p>
          <Button
            onClick={handleNextQuestion}
            className="mt-4 rounded-full bg-black px-8 py-4 text-lg text-white hover:bg-gray-800"
          >
            下一題
          </Button>
        </div>
      </div>
    </div>
  );
}
