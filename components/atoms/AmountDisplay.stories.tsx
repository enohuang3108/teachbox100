import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import AmountDisplay from "./AmountDisplay";

/**
 * 七段顯示器風格的金額牌。底色是 `--panel`，**不跟暗色翻面** ——
 * 它畫的是一塊實體面板，不是介面表面。
 */
const meta = {
  title: "Atoms/AmountDisplay",
  component: AmountDisplay,
  args: { label: "總金額", amount: 128, amountColor: "text-success" },
} satisfies Meta<typeof AmountDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 預設: Story = {};

export const 尺寸: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-4">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <AmountDisplay key={size} {...args} size={size} label={size} />
      ))}
    </div>
  ),
};

/** 金額色走狀態 token：應付用 warning、找零與總價用 success。 */
export const 金額色: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <AmountDisplay {...args} label="應付" amount={97} amountColor="text-warning" size="md" />
      <AmountDisplay {...args} label="找零" amount={3} amountColor="text-success" size="md" />
    </div>
  ),
};

export const 尚未輸入: Story = {
  args: { amount: null },
};
