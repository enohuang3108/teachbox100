import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import DigitAnswer, { type DigitValue } from "./DigitAnswer";
import KeypadAnswer from "./KeypadAnswer";
import MultipleChoiceAnswer from "./MultipleChoiceAnswer";

/**
 * 三種作答方式，由單元的設定面板選。它們吃同一種介面：
 * 受控的 value + onChange，不自己記答案。
 */
const meta = {
  title: "Molecules/作答方式",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 數字調整：上下鈕各管一位，讀時鐘與找零都用這個。 */
export const 數字調整: Story = {
  render: () => {
    const [value, setValue] = useState<DigitValue>({ hour: 9, minute: 30 });
    return (
      <DigitAnswer
        value={value}
        onChange={setValue}
        config={{
          hour: { label: "時", max: 24, digits: 2 },
          minute: { label: "分", max: 60, digits: 2 },
        }}
      />
    );
  },
};

/** 手動輸入：數字鍵盤。清除是 danger、退格是 warning。 */
export const 手動輸入: Story = {
  render: () => {
    const [value, setValue] = useState("12");
    return (
      <div className="max-w-xs">
        <KeypadAnswer value={value} onChange={setValue} />
      </div>
    );
  },
};

/** 選擇題：低年級的入門難度。 */
export const 選擇題: Story = {
  render: () => {
    const [value, setValue] = useState("35");
    return (
      <div className="max-w-sm">
        <MultipleChoiceAnswer
          choices={[25, 35, 45, 55]}
          selectedValue={value}
          choicesText={(v) => `${v} 元`}
          onSelect={setValue}
        />
      </div>
    );
  },
};
