import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { OptionPills } from "./OptionPills";

/** 設定面板的純單選：骰子顆數、分幾組。選取的那顆換底色與實邊，不靠色相區分。 */
const meta = {
  title: "Molecules/OptionPills",
  component: OptionPills,
  args: {
    name: "dice-count",
    value: 2,
    options: [1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: `${n} 顆` })),
    onChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <OptionPills {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof OptionPills<number>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 骰子顆數: Story = {};

export const 分組數: Story = {
  args: {
    name: "groups",
    value: 3,
    options: [2, 3, 4, 5, 6].map((n) => ({ value: n, label: `${n} 組` })),
  },
};
