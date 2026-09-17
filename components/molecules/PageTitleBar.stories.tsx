import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { ACTION_BTN } from "@/components/templates/GamePageTemplate";
import { FeedbackButton } from "@/components/atoms/FeedbackButton";
import { PageTitleBar } from "./PageTitleBar";

/**
 * 教材頁頂端那一列：logo 貼左、麵包屑接著、操作鈕靠右。
 * **麵包屑最後一節就是這頁的 h1**，所以內文不再另外放大標題。
 */
const meta = {
  title: "Molecules/PageTitleBar",
  component: PageTitleBar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="bg-paper min-h-48">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  args: {
    trail: [
      { path: "/coin", title: "認識金錢" },
      { path: "/coin/buy", title: "購物" },
    ],
    siblings: [
      { path: "/coin/introduction", title: "認識硬幣" },
      { path: "/coin/buy", title: "購物" },
      { path: "/coin/change", title: "找零" },
    ],
  },
} satisfies Meta<typeof PageTitleBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 教材頁: Story = {
  args: { actions: <FeedbackButton className={ACTION_BTN} label="使用回饋" /> },
};

/** 分類頁的 h1 是內文那個大標，這條列上就不要再出一個，否則一頁兩個 h1。 */
export const 分類頁: Story = {
  args: { asHeading: false, trail: [{ path: "/coin", title: "認識金錢" }] },
};
