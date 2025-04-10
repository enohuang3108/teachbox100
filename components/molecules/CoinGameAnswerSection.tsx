"use client";

import KeypadAnswer from "../organisms/keypad-answer";
import MultipleChoiceAnswer from "../organisms/multiple-choice-answer";
import DigitInput from "./digit-input";
import GameAnswerSection from "./GameAnswerSection";

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
      correctFeedback={`正確！總共是 ${totalValue} 元。`}
      incorrectFeedback={`不正確，再試一次！正確答案是 ${totalValue} 元。`}
      showFeedback={showFeedback}
      checkAnswer={checkAnswer}
      handleNextQuestion={handleNextQuestion}
    >
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
    </GameAnswerSection>
  );
}
