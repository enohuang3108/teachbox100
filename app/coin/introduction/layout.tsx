import { pages } from "@/app/pages.config";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "認識新臺幣 | 幣值學習 | TeachBox100 台灣互動學習平台",
  description: "認識台灣新臺幣的各種面額、外觀特徵與等值換算，透過互動式介面輕鬆學習1元、5元、10元、50元、100元直至2000元紙鈔的特色與使用方式。",
  alternates: {
    canonical: (process.env.NEXT_PUBLIC_SITE_URL || "https://teachbox100.com") + pages["coin-introduction"].path,
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
