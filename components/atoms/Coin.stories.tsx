import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Coin from "./Coin";

/** 硬幣圖在 `public/images/coins/`，尺寸預設隨面額變大，需要時用 `size` 壓平。 */
const meta = {
  title: "Atoms/Coin",
  component: Coin,
  args: { coinValue: 10 },
} satisfies Meta<typeof Coin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 單枚: Story = {};

/** 預設尺寸刻意隨面額遞增 —— 實體硬幣就是越大面額越大。 */
export const 全部面額: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-3">
      {[1, 5, 10, 50, 100, 200, 500, 1000, 2000].map((value) => (
        <Coin key={value} coinValue={value} />
      ))}
    </div>
  ),
};

/** 排成一列時給同一個 `size`，不然大小不一看起來像壞掉。 */
export const 固定尺寸: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {[1, 5, 10, 50, 100].map((value) => (
        <Coin key={value} coinValue={value} size={56} />
      ))}
    </div>
  ),
};
