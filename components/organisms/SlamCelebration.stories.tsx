import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GAME_STAGE_ID } from "@/components/templates/PageTemplate";
import { SlamCelebration } from "./SlamCelebration";

/**
 * 揭曉大數字的慶祝：砸下、震一下、紙屑、紙膠帶。紙屑畫在 #game-stage 裡，
 * 所以 story 包一層同 id 的舞台。
 */
const meta = {
  title: "Organisms/SlamCelebration",
  component: SlamCelebration,
  decorators: [
    (Story) => (
      <div id={GAME_STAGE_ID} className="grid min-h-[80vh] place-items-center bg-paper">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SlamCelebration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 終極密碼: Story = { args: { value: 37 } };

export const 自訂文字: Story = { args: { value: 100, label: "全對！" } };
