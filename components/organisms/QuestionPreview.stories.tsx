import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QuestionPreview } from "./QuestionPreview";

const meta = { title: "Organisms/題庫預覽", component: QuestionPreview } satisfies Meta<typeof QuestionPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 長答案提醒: Story = {
  args: { questions: [{ id: "photosynthesis", type: "choice", text: "哪個選項描述光合作用？", options: ["呼吸", "植物利用陽光製造養分的過程"], answer: "植物利用陽光製造養分的過程", difficulty: "normal" }] },
};
export const 十字以內: Story = {
  args: { questions: [{ id: "mountain", type: "choice", text: "台灣最高的山是？", options: ["玉山", "雪山"], answer: "玉山", difficulty: "easy" }] },
};
