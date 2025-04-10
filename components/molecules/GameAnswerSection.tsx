"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { getRandomConfettiEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import { useEffect } from "react";

interface GameAnswerSectionProps {
  question: string;
  hasAnswer: boolean;
  isCorrect: boolean | null;
  correctFeedback: string;
  incorrectFeedback: string;
  showFeedback: boolean;
  children: React.ReactNode;
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
  children,
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
  }, [isCorrect]);

  return (
    <div className="mt-16 relative">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">{question}</h2>
      {children}
      {/* 提交按鈕 */}
      <div className="mt-6 md:mt-8">
        <Button
          onClick={checkAnswer}
          className="w-full bg-black hover:bg-gray-800 text-white text-xl md:text-2xl py-5 md:py-6 rounded-full"
          disabled={!hasAnswer || showFeedback}
        >
          確定
        </Button>
      </div>

      {/* 回饋訊息 */}
      <div
        className={`absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-300 ${
          showFeedback ? "opacity-100" : "opacity-0 pointer-events-none"
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
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {isCorrect === null
              ? "" // 不顯示文字直到狀態確定
              : isCorrect
              ? correctFeedback
              : incorrectFeedback}
          </p>
          <Button
            onClick={handleNextQuestion}
            className="mt-4 bg-black hover:bg-gray-800 text-white text-lg py-4 px-8 rounded-full"
          >
            下一題
          </Button>
        </div>
      </div>
    </div>
  );
}
