import "../styles/globals.css";

import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { ViewTransitions } from "next-view-transitions";
import { Noto_Sans_TC, Nunito } from "next/font/google";
import { useEffect } from "react";

// 跟 app/layout.tsx 同一組字體，否則 Storybook 量到的字寬跟站上不一樣
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-tc",
  display: "swap",
  preload: false,
});

/** 亮暗切換掛在 <html> 上，跟站上一樣 —— 元件不該知道自己在哪個主題裡。 */
const withTheme: Decorator = (Story, context) => {
  const dark = context.globals.theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <ViewTransitions>
      <div className={`${nunito.variable} ${notoSansTC.variable} font-sans bg-background text-foreground p-6`}>
        <Story />
      </div>
    </ViewTransitions>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "亮色 / 暗色",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "亮色" },
          { value: "dark", title: "暗色" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    // ImageCard、PageTitleBar 用 next-view-transitions 的 Link，它會呼叫 useRouter。
    // 沒掛 app router 的 mock 就是「invariant expected app router to be mounted」。
    nextjs: { appDirectory: true },
    // 元件自己畫底色，Storybook 的畫布不要再蓋一層
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
