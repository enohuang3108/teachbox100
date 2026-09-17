import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { pages } from "@/app/pages.config";
import { ImageCard } from "./ImageCard";

/**
 * 首頁與分類頁的教材卡。卡片本身一律 `bg-card`，顏色只出現在封面插圖裡 ——
 * 八張卡各一個底色會讓整頁變雜貨店。
 */
const meta = {
  title: "Molecules/ImageCard",
  component: ImageCard,
  args: {
    imageSrc: pages["coin-buy"].imageSrc,
    blurDataURL: pages["coin-buy"].blurDataURL,
    cardTitle: "購物",
    cardDescription: "挑出剛好的硬幣付款，算出該找多少錢。",
    link: "/coin/buy",
  },
} satisfies Meta<typeof ImageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 單張: Story = {
  render: (args) => (
    <div className="max-w-[320px]">
      <ImageCard {...args} />
    </div>
  ),
};

/** 格線裡靠 `index` 做 stagger 進場，一張比一張晚 50ms 左右。 */
export const 格線: Story = {
  render: (args) => (
    <div className="grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {(["coin-buy", "clock-current-time", "multiplication", "memory", "monopoly", "timer"] as const).map(
        (key, index) => (
          <ImageCard
            {...args}
            key={key}
            index={index}
            imageSrc={pages[key].imageSrc}
            blurDataURL={pages[key].blurDataURL}
            cardTitle={pages[key].title}
            link={pages[key].path}
          />
        ),
      )}
    </div>
  ),
};
