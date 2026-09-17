import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import KeypadAnswer from "./answer/KeypadAnswer";
import GameAnswerSection from "./GameAnswerSection";

/**
 * 題目 + 作答區 + 送出鈕的外殼。答完之後整片蓋上回饋層（`bg-paper/95`），
 * 送出鈕換成「下一題」。作答元件由呼叫端塞進 children。
 */
const meta = {
  title: "Molecules/GameAnswerSection",
  component: GameAnswerSection,
  args: {
    question: "這些硬幣一共多少錢？",
    correctFeedback: "答對了！",
    incorrectFeedback: "再數一次看看",
    checkAnswer: () => {},
    handleNextQuestion: () => {},
  },
} satisfies Meta<typeof GameAnswerSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const Keypad = () => {
  const [value, setValue] = useState("66");
  return <KeypadAnswer value={value} onChange={setValue} />;
};

export const 作答中: Story = {
  args: { hasAnswer: true, isCorrect: null, showFeedback: false, children: <Keypad /> },
};

export const 還沒作答: Story = {
  args: { hasAnswer: false, isCorrect: null, showFeedback: false, children: <Keypad /> },
};

export const 答對: Story = {
  args: { hasAnswer: true, isCorrect: true, showFeedback: true, children: <Keypad /> },
};

export const 答錯: Story = {
  args: { hasAnswer: true, isCorrect: false, showFeedback: true, children: <Keypad /> },
};
