import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * 每一級都自帶行高、字重、字距，用的時候不必再補 `leading-*` `font-*` `tracking-*`。
 * 中文行高一律 ≥ 1.7，token 已經帶好。
 */
const meta = {
  title: "Foundations/字級",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({
  token,
  role,
  children,
}: {
  token: string;
  role: string;
  children: React.ReactNode;
}) => (
  <div className="border-border space-y-1 border-b py-5 last:border-0">
    <div className="flex gap-3">
      <code className="text-caption text-muted-foreground">{token}</code>
      <span className="text-caption text-muted-foreground">{role}</span>
    </div>
    {children}
  </div>
);

export const 階層: Story = {
  render: () => (
    <div className="p-6">
      <Row token="text-display" role="品牌名">
        <p className="text-display">TeachBox100</p>
      </Row>
      <Row token="text-hero" role="分類頁標題">
        <p className="text-hero">認識金錢</p>
      </Row>
      <Row token="text-h1" role="頁面副標">
        <p className="text-h1">從遊戲開始，把知識留下</p>
      </Row>
      <Row token="text-h2" role="區塊標題">
        <p className="text-h2">選一個有興趣的開始吧！</p>
      </Row>
      <Row token="text-h3" role="卡片標題">
        <p className="text-h3">學習讀時鐘</p>
      </Row>
      <Row token="text-body-lg" role="hero 副標">
        <p className="text-body-lg">認識新臺幣、看懂時鐘、算出找零。</p>
      </Row>
      <Row token="text-body" role="內文">
        <p className="text-body max-w-prose">
          把生活裡真的用得到的能力，變成孩子玩得下去、能夠學習的小遊戲。中文沒有斷詞，
          長句會斷在詞中間，桌機用 br 強制斷在句號。
        </p>
      </Row>
      <Row token="text-caption" role="說明、chip">
        <p className="text-caption">適合 1–2 年級</p>
      </Row>
    </div>
  ),
};

/** 遊戲場景裡吃螢幕的大數字是逐場調過的，留在元件裡寫 `text-[clamp(...)]`，不進字級表。 */
export const 場景大字: Story = {
  render: () => (
    <div className="space-y-4 p-6">
      <p className="font-display text-[clamp(3rem,13vw,5rem)] font-black">7 × 8</p>
      <p className="text-caption text-muted-foreground">
        九九乘法的題目：<code>text-[clamp(3rem,13vw,5rem)]</code>
      </p>
    </div>
  ),
};
