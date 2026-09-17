import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { pages } from "@/app/pages.config";
import { UnitHero } from "./UnitHero";

/**
 * 「先看說明再進內容」的介紹頁頭。大標取 `slogan`，說明只放 `intro` 第一句。
 * 頁面上不直接用它 —— 走 `PageTemplate landing`，大富翁走 `MonopolyGate`。
 */
const meta = {
  title: "Organisms/UnitHero",
  component: UnitHero,
  args: { onStart: () => {} },
} satisfies Meta<typeof UnitHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 計時器: Story = {
  args: { page: pages.timer, intro: pages.timer.intro, startLabel: "開始使用" },
};

export const 噪音計: Story = {
  args: { page: pages.noise, intro: pages.noise.intro, startLabel: "噓" },
};

export const 大富翁: Story = {
  args: { page: pages.monopoly, intro: pages.monopoly.intro, startLabel: "開始遊戲" },
};
