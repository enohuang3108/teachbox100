import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { ACTION_BTN } from "@/components/templates/GamePageTemplate";
import { FeedbackButton } from "./FeedbackButton";
import { FullscreenButton } from "./FullscreenButton";
import { SettingsButton } from "./SettingsButton";
import { SoundToggleButton } from "./SoundToggleButton";

/**
 * 教材頁右上角那一排。全部共用 `ACTION_BTN` 這一組 class，
 * 並且**必須**包在 `TooltipProvider` 裡 —— 它們的提示走同一個延遲設定，
 * 第一顆開了之後滑到隔壁就不再等。
 */
const meta = {
  title: "Atoms/頂列操作鈕",
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={350} skipDelayDuration={600}>
        <div className="flex items-center gap-2">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 整排: Story = {
  render: () => {
    const [sound, setSound] = useState(true);
    return (
      <>
        <FeedbackButton className={ACTION_BTN} label="使用回饋" />
        <SoundToggleButton on={sound} onToggle={setSound} />
        <SettingsButton onClick={() => {}} />
        <FullscreenButton targetId="storybook-stage" />
      </>
    );
  },
};

/** 音效鈕是唯一有開關狀態的一顆，`aria-pressed` 要跟著換。 */
export const 音效開關: Story = {
  render: () => {
    const [sound, setSound] = useState(true);
    return <SoundToggleButton on={sound} onToggle={setSound} />;
  },
};
