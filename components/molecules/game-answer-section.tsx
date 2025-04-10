"use client";

import { Button } from "@/components/atoms/shadcn/button";
import DigitInput from "./digit-input";
import KeypadAnswer from "./keypad-answer";
import MultipleChoiceAnswer from "./multiple-choice-answer";

interface GameAnswerSectionProps {
  answerMethod: string;
  userAnswer: string;
  choices: number[];
  totalValue: number;
  isCorrect: boolean | null;
  showFeedback: boolean;
  setUserAnswer: (answer: string) => void;
  checkAnswer: () => void;
  handleNextQuestion: () => void;
}

export default function GameAnswerSection({
  answerMethod,
  userAnswer,
  choices,
  totalValue,
  isCorrect,
  showFeedback,
  setUserAnswer,
  checkAnswer,
  handleNextQuestion,
}: GameAnswerSectionProps) {
  return (
    <div className="mt-16 relative">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">硬幣總共有多少元?</h2>

      {/* 根據選擇的答案方式顯示不同的輸入方式 */}
      <div className="mt-4">
        {answerMethod === "multiple" ? (
          <MultipleChoiceAnswer
            choices={choices}
            selectedValue={userAnswer}
            onSelect={setUserAnswer}
          />
        ) : answerMethod === "keypad" ? (
          <KeypadAnswer value={userAnswer} onChange={setUserAnswer} />
        ) : (
          <DigitInput value={userAnswer} onChange={setUserAnswer} />
        )}
      </div>

      {/* 提交按鈕 */}
      <div className="mt-6 md:mt-8">
        <Button
          onClick={checkAnswer}
          className="w-full bg-black hover:bg-gray-800 text-white text-xl md:text-2xl py-5 md:py-6 rounded-full"
          disabled={!userAnswer || showFeedback}
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
              ? `正確！總共是 ${totalValue} 元。`
              : `不正確，再試一次！正確答案是 ${totalValue} 元。`}
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
