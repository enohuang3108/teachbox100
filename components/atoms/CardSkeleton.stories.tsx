import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CardSkeleton } from "./CardSkeleton";

/** 首頁卡片的載入骨架，形狀照 `ImageCard` 量的 —— 換進真卡時不該有跳動。 */
const meta = {
  title: "Atoms/CardSkeleton",
  component: CardSkeleton,
} satisfies Meta<typeof CardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 預設: Story = {};

export const 一整排: Story = {
  render: () => (
    <div className="flex flex-wrap gap-5">
      {[0, 1, 2].map((i) => (
        <CardSkeleton key={i} cardWidth={260} />
      ))}
    </div>
  ),
};
