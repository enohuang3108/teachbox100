import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CoinDisplayArea from "./CoinDisplayArea";

const COINS = [
  { value: 50, name: "50元" },
  { value: 10, name: "10元" },
  { value: 10, name: "10元" },
  { value: 5, name: "5元" },
  { value: 1, name: "1元" },
];

/** 題目區：這一題發下來的硬幣。答對答錯換整片底色，投影時最後一排也看得出來。 */
const meta = {
  title: "Molecules/CoinDisplayArea",
  component: CoinDisplayArea,
  args: { coins: COINS },
} satisfies Meta<typeof CoinDisplayArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 出題: Story = {};

export const 答對: Story = {
  args: { showFeedback: true, isCorrect: true },
};

export const 答錯: Story = {
  args: { showFeedback: true, isCorrect: false },
};

/** 換下一題時先跑這個狀態，避免硬幣「原地變臉」。 */
export const 準備硬幣中: Story = {
  args: { coins: [], isGeneratingNewCoins: true },
};

export const 沒有硬幣: Story = {
  args: { coins: [] },
};
