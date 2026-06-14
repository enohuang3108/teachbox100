import { pages } from "@/app/pages.config";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "計算金錢價值 | 硬幣計算遊戲 | TeachBox100 台灣互動學習平台",
  description: "台灣互動式硬幣計算遊戲，幫助學童學習計算不同幣值總和，提供多種答題模式與難度設定，透過趣味遊戲培養金錢數學能力與計算思維。",
  alternates: {
    canonical: (process.env.NEXT_PUBLIC_SITE_URL || "https://teachbox100.com") + pages["coin-value"].path,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
