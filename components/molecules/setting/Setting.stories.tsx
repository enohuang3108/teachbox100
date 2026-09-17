import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { AnswerMethod } from "./AnswerMethod";
import { CoinsOrder } from "./CoinsOrder";
import { MoneyRange } from "./MoneyRange";

/**
 * 設定面板的欄位。選項之間的差別是文字不是色相 —— 選取態全站共用
 * `SELECTED_OPTION`（`lib/ui-classes.ts`）。
 */
const meta = {
  title: "Molecules/設定欄位",
  decorators: [(Story) => <div className="max-w-sm space-y-6"><Story /></div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 回答方式: Story = {
  render: () => {
    const [method, setMethod] = useState("digit");
    return <AnswerMethod answerMethod={method} setAnswerMethod={setMethod} />;
  },
};

export const 硬幣排列: Story = {
  render: () => {
    const [ordered, setOrdered] = useState(true);
    return <CoinsOrder isOrdered={ordered} setIsOrdered={setOrdered} />;
  },
};

export const 金錢區間: Story = {
  render: () => {
    const [range, setRange] = useState({ minAmount: 10, maxAmount: 500 });
    return (
      <MoneyRange
        minAmount={range.minAmount}
        maxAmount={range.maxAmount}
        onChange={setRange}
        onCommit={setRange}
      />
    );
  },
};

export const 整組: Story = {
  render: () => {
    const [method, setMethod] = useState("multiple");
    const [ordered, setOrdered] = useState(false);
    return (
      <>
        <AnswerMethod answerMethod={method} setAnswerMethod={setMethod} />
        <CoinsOrder isOrdered={ordered} setIsOrdered={setOrdered} />
      </>
    );
  },
};
