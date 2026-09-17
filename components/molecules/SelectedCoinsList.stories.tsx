import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import SelectedCoinsList, { type SelectedCoin } from "./SelectedCoinsList";

/** 作答區：已經挑出來的硬幣。滑到硬幣上才出現移除鈕，沒滑過去時畫面是乾淨的。 */
const meta = {
  title: "Molecules/SelectedCoinsList",
  component: SelectedCoinsList,
  args: { selectedCoins: [], onRemoveCoin: () => {} },
} satisfies Meta<typeof SelectedCoinsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 可移除: Story = {
  render: () => {
    const [coins, setCoins] = useState<SelectedCoin[]>([
      { id: 1, value: 50, name: "50元" },
      { id: 2, value: 10, name: "10元" },
      { id: 3, value: 5, name: "5元" },
    ]);
    return (
      <SelectedCoinsList
        selectedCoins={coins}
        onRemoveCoin={(coin) => setCoins((list) => list.filter((c) => c.id !== coin.id))}
      />
    );
  },
};

export const 還沒選: Story = {};
