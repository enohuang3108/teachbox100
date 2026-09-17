import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Dialog, DialogContent, DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Switch } from "@/components/atoms/shadcn/switch";
import { ListOrdered, SlidersHorizontal } from "lucide-react";
import { StepSetup } from "./StepSetup";

/**
 * 介紹頁之後、開始之前的設定旅程。放在 DialogContent（`max-w-4xl gap-0 overflow-hidden p-0`）裡。
 * 側欄隨時可跳；最後一站才是開始；`blocker` 有值時底列顯示原因並擋住開始。
 */
const meta = {
  title: "Organisms/StepSetup",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function WheelLike({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [remove, setRemove] = useState(false);
  const count = text.split("\n").filter((s) => s.trim()).length;
  return (
    <Dialog open>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
        <StepSetup
          title="轉盤設定"
          startLabel="開始"
          onStart={() => {}}
          blocker={count < 2 ? "至少要 2 個項目" : null}
          steps={[
            {
              key: "entries",
              label: "名單",
              icon: ListOrdered,
              summary: `${count} 個`,
              done: count >= 2,
              content: (
                <section className="space-y-4">
                  <h3 className="text-h3 text-ink">轉盤上要有誰？</h3>
                  <DialogDescription>一行一個。</DialogDescription>
                  <textarea
                    aria-label="名單"
                    rows={8}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="border-border bg-background w-full rounded-2xl border px-4 py-3"
                  />
                </section>
              ),
            },
            {
              key: "rules",
              label: "玩法",
              icon: SlidersHorizontal,
              summary: remove ? "抽過的拿掉" : "可以重複抽",
              content: (
                <label className="flex items-center justify-between gap-4">
                  <span className="text-ink font-semibold">抽過的拿掉</span>
                  <Switch checked={remove} onCheckedChange={setRemove} />
                </label>
              ),
            },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
}

export const 兩站: Story = { render: () => <WheelLike initial={"小明\n小華\n小美"} /> };

/** 名單不夠時，底列換成紅字原因、開始鈕停用 */
export const 擋住開始: Story = { render: () => <WheelLike initial="小明" /> };
