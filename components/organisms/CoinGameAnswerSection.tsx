"use client";

import DigitAnswer, {
  DigitConfig,
  DigitValue,
} from "@/components/molecules/answer/DigitAnswer";
import KeypadAnswer from "@/components/molecules/answer/KeypadAnswer";
import MultipleChoiceAnswer from "@/components/molecules/answer/MultipleChoiceAnswer";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import { getRandomFeedback } from "@/lib/utils/gameFeedback";
import { useMemo } from "react";

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

export default function CoinGameAnswerSection({
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
  const digitConfig: Record<string, DigitConfig> = useMemo(
    () => ({
      thousand: { label: "千", max: 10, digits: 1 },
      hundred: { label: "百", max: 10, digits: 1 },
      ten: { label: "十", max: 10, digits: 1 },
      one: { label: "個", max: 10, digits: 1 },
    }),
    [],
  );

  const digitValue: DigitValue = useMemo(() => {
    const num = parseInt(userAnswer, 10) || 0;
    return {
      thousand: Math.floor(num / 1000) % 10,
      hundred: Math.floor(num / 100) % 10,
      ten: Math.floor(num / 10) % 10,
      one: num % 10,
    };
  }, [userAnswer]);

  const handleDigitChange = (newValue: Record<string, number>) => {
    const { thousand = 0, hundred = 0, ten = 0, one = 0 } = newValue;
    const combinedValue = thousand * 1000 + hundred * 100 + ten * 10 + one;
    setUserAnswer(combinedValue.toString());
  };

  return (
    <GameAnswerSection
      question={"硬幣總共有多少元?"}
      hasAnswer={userAnswer !== ""}
      isCorrect={isCorrect}
      correctFeedback={getRandomFeedback("coingameCorrect", totalValue)}
      incorrectFeedback={getRandomFeedback("coingameIncorrect", totalValue)}
      showFeedback={showFeedback}
      checkAnswer={checkAnswer}
      handleNextQuestion={handleNextQuestion}
    >
      <div className="mt-4">
        {answerMethod === "multiple" ? (
          <MultipleChoiceAnswer
            choices={choices}
            selectedValue={userAnswer}
            choicesText={(value) => `${value} 元`}
            onSelect={setUserAnswer}
          />
        ) : answerMethod === "keypad" ? (
          <KeypadAnswer value={userAnswer} onChange={setUserAnswer} />
        ) : (
          <DigitAnswer
            value={digitValue}
            onChange={handleDigitChange}
            config={digitConfig}
          />
        )}
      </div>
    </GameAnswerSection>
  );
}
