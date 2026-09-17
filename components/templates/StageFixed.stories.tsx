import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/atoms/shadcn/button";
import { GAME_STAGE_ID } from "./PageTemplate";
import { StageFixed } from "./StageFixed";

const PRESS = "transition-transform duration-press ease-out active:scale-[0.97]";

/**
 * 工具頁貼螢幕邊的控制項。內容 portal 到 `#game-stage`，全螢幕等比縮放時照樣貼角落。
 * 慣例：右下角直排圓鈕，最常按的最大、放最下面（計時器）；直立刻度尺貼右邊置中（噪音計）。
 */
const meta = {
  title: "Templates/StageFixed",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div id={GAME_STAGE_ID} className="bg-paper h-screen w-full">
        <p className="text-muted-foreground p-6">舞台內容（全螢幕時整塊被等比縮放）</p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 右下角圓鈕: Story = {
  render: () => (
    <StageFixed>
      <div className="fixed right-6 bottom-6 z-(--z-sticky) flex flex-col items-center gap-3">
        <Button variant="outline" className={`size-16 rounded-full p-0 text-sm font-bold ${PRESS}`}>
          +1 分
        </Button>
        <Button variant="outline" className={`size-16 rounded-full p-0 text-sm font-bold ${PRESS}`}>
          重設
        </Button>
        <Button className={`mt-2 size-24 rounded-full p-0 text-xl font-bold ${PRESS}`}>
          開始
        </Button>
      </div>
    </StageFixed>
  ),
};
