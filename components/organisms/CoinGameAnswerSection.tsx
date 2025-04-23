"use client";

import DigitInput from "@/components/molecules/digit-input";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import KeypadAnswer from "@/components/organisms/keypad-answer";
import MultipleChoiceAnswer from "@/components/organisms/multiple-choice-answer";
import { getRandomFeedback } from "@/lib/utils/gameFeedback";

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
          <DigitInput value={userAnswer} onChange={setUserAnswer} />
        )}
      </div>
    </GameAnswerSection>
  );
}
