import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * 色票的權威來源是 `styles/globals.css`。這一頁把它們畫出來，
 * 用工具列的亮暗切換看每一格在兩個主題下各是什麼。
 */
const meta = {
  title: "Foundations/色彩",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Swatch = ({ token, note }: { token: string; note?: string }) => (
  <div className="flex items-center gap-3">
    <div className={`size-12 shrink-0 rounded-lg border border-border ${token}`} />
    <div className="min-w-0">
      <code className="text-caption">{token}</code>
      {note ? <p className="text-caption text-muted-foreground">{note}</p> : null}
    </div>
  </div>
);

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h3 className="text-h3">{title}</h3>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  </section>
);

export const 色票: Story = {
  render: () => (
    <div className="space-y-10 p-6">
      <Group title="紙感底色">
        <Swatch token="bg-paper" note="頁面底" />
        <Swatch token="bg-card" note="卡片" />
        <Swatch token="bg-muted" note="凹下去的區塊" />
        <Swatch token="bg-secondary" note="次級底、選取態" />
        <Swatch token="bg-accent" note="hover" />
        <Swatch token="bg-panel" note="實體面板；刻意不跟暗色翻面" />
      </Group>

      <Group title="文字與線">
        <Swatch token="bg-foreground" note="text-foreground" />
        <Swatch token="bg-muted-foreground" note="text-muted-foreground" />
        <Swatch token="bg-stone" note="border-stone" />
        <Swatch token="bg-border" note="border-border" />
      </Group>

      <Group title="品牌四色（從 blob 色塊取樣）">
        <Swatch token="bg-brand-yellow" />
        <Swatch token="bg-brand-red" />
        <Swatch token="bg-brand-blue" />
        <Swatch token="bg-brand-green" />
      </Group>

      <section className="space-y-3">
        <h3 className="text-h3">狀態色</h3>
        <p className="text-caption text-muted-foreground">
          soft 當底、ink 當字。<code>text-warning</code> 當字色對比不足，要字就用{" "}
          <code>text-warning-ink</code>。
        </p>
        {/* class 寫死不組字串 —— Tailwind 掃的是原始碼字面值，組出來的名字不會被產生 */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-success-soft rounded-xl p-4">
            <p className="text-h3 text-success-ink">success</p>
            <div className="bg-success mt-3 h-6 rounded" />
            <code className="text-caption text-muted-foreground">bg-success-soft / text-success-ink</code>
          </div>
          <div className="bg-warning-soft rounded-xl p-4">
            <p className="text-h3 text-warning-ink">warning</p>
            <div className="bg-warning mt-3 h-6 rounded" />
            <code className="text-caption text-muted-foreground">bg-warning-soft / text-warning-ink</code>
          </div>
          <div className="bg-danger-soft rounded-xl p-4">
            <p className="text-h3 text-danger-ink">danger</p>
            <div className="bg-danger mt-3 h-6 rounded" />
            <code className="text-caption text-muted-foreground">bg-danger-soft / text-danger-ink</code>
          </div>
          <div className="bg-info-soft rounded-xl p-4">
            <p className="text-h3 text-info-ink">info</p>
            <div className="bg-info mt-3 h-6 rounded" />
            <code className="text-caption text-muted-foreground">bg-info-soft / text-info-ink</code>
          </div>
        </div>
      </section>
    </div>
  ),
};
