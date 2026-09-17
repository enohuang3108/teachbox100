import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

/**
 * 時長與曲線都是 token。規則：只動 transform 與 opacity、`transition` 列舉屬性、
 * hover 用位移不用 scale、退場比進場快。
 */
const meta = {
  title: "Foundations/動效",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 時長: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    const rows = [
      ["duration-press", "按下回饋", "duration-press"],
      ["duration-hover", "hover、顏色變化", "duration-hover"],
      ["duration-enter", "進場", "duration-enter"],
      ["duration-exit", "退場（比進場快）", "duration-exit"],
      ["duration-flip", "翻牌", "duration-flip"],
    ] as const;

    return (
      <div className="space-y-6 p-6">
        <button
          type="button"
          onClick={() => setOn((v) => !v)}
          className="bg-ink text-paper duration-press active:scale-[0.97] rounded-full px-5 py-2 transition-transform"
        >
          {on ? "收回" : "推出"}
        </button>
        <div className="space-y-4">
          {rows.map(([token, role]) => (
            <div key={token} className="space-y-1">
              <code className="text-caption text-muted-foreground">
                {token} —— {role}
              </code>
              <div className="bg-muted h-8 rounded-full">
                <div
                  className={`bg-primary ease-out h-8 rounded-full transition-[width] ${token}`}
                  style={{ width: on ? "100%" : "12%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/** hover 位移用 `-translate-y-[3px]` —— scale 會讓 next/image 的圖糊掉。 */
export const Hover與按下: Story = {
  render: () => (
    <div className="flex gap-4 p-6">
      <div className="bg-card border-border duration-hover hover:-translate-y-[3px] active:scale-[0.97] w-40 rounded-xl border p-6 text-center transition-transform">
        位移
      </div>
      <div className="bg-card border-border duration-hover hover:scale-105 w-40 rounded-xl border p-6 text-center transition-transform">
        scale（已廢止）
      </div>
    </div>
  ),
};
