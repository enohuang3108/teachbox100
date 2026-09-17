import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SimpleCard } from "./SimpleCard";

/** 四角有記號的紙卡，遊戲區塊的通用外框。 */
const meta = {
  title: "Atoms/SimpleCard",
  component: SimpleCard,
  args: {
    children: <p className="text-body p-8 text-center">把商品拖到這裡，或點一下商品放進購物車</p>,
  },
} satisfies Meta<typeof SimpleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 預設: Story = {};

/** 答對答錯用狀態色換底，不是換邊框顏色 —— 投影時最後一排也看得出來。 */
export const 答題回饋: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <SimpleCard className="bg-success-soft ring-success/30 ring-2">
        <p className="text-h3 text-success-ink p-8 text-center">答對了</p>
      </SimpleCard>
      <SimpleCard className="bg-danger-soft ring-danger/30 ring-2">
        <p className="text-h3 text-danger-ink p-8 text-center">再試一次</p>
      </SimpleCard>
    </div>
  ),
};
