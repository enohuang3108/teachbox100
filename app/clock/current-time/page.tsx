"use client";

import { pages } from "@/app/pages.config";
import Clock from "@/components/atoms/Clock";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import MultipleChoiceAnswer from "@/components/organisms/multiple-choice-answer";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { getRandomFeedback } from "@/lib/utils/gameFeedback";
import { generateTimeChoices, timeToText } from "@/lib/utils/timeUtils";
import { useEffect, useState } from "react";

export default function CurrentTimePage() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [precision, setPrecision] = useState<"minute" | "second">("minute");

  // 初始化和重新產生選項
  useEffect(() => {
    generateNewChoices(currentTime);
  }, [currentTime]);

  // 產生新的選擇題選項
  const generateNewChoices = (time: Date) => {
    const newChoices = generateTimeChoices(time);
    setChoices(newChoices);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  // 處理時鐘時間變更
  const handleTimeChange = (newTime: Date) => {
    setCurrentTime(newTime);
  };

  // 檢查答案是否正確
  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const correctAnswer = timeToText(currentTime);
    setIsCorrect(selectedAnswer === correctAnswer);
  };

  // 切換時鐘精度
  const handleChangePrecision = () => {
    if (precision === "minute") {
      setPrecision("second");
    } else {
      setPrecision("minute");
    }
  };

  const resetTime = () => {
    const randomHour = Math.floor(Math.random() * 12);
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);
    const newTime = new Date();
    newTime.setHours(randomHour, randomMinute, randomSecond);
    setCurrentTime(newTime);
  };
  return (
    <GamePageTemplate
      title={pages["clock-current-time"].title}
      resetGame={resetTime}
      settings={<></>}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        <Clock
          precision={precision}
          initialTime={currentTime}
          onChange={handleTimeChange}
          draggable={false}
          className="h-72 w-72 md:mb-2 md:h-80 md:w-80"
        />

        <GameAnswerSection
          question={`請問時鐘的時間是？`}
          hasAnswer={selectedAnswer !== null}
          isCorrect={isCorrect}
          correctFeedback={getRandomFeedback(
            "clockgameCorrect",
            timeToText(currentTime),
          )}
          incorrectFeedback={getRandomFeedback(
            "clockgameIncorrect",
            timeToText(currentTime),
          )}
          showFeedback={isCorrect !== null}
          checkAnswer={checkAnswer}
          handleNextQuestion={resetTime}
          className="mt-0"
        >
          <MultipleChoiceAnswer
            choices={choices}
            selectedValue={selectedAnswer ?? ""}
            onSelect={setSelectedAnswer}
            choicesText={(value) => value.toString()}
          />
        </GameAnswerSection>
      </div>
    </GamePageTemplate>
  );
}
