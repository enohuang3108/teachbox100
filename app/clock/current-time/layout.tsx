import { pages } from "@/app/pages.config";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "學習讀時鐘 | 時間遊戲 | TeachBox100 台灣互動學習平台",
  description: "台灣互動式時鐘學習遊戲，幫助孩子輕鬆學會看時間、認識時針與分針，透過趣味互動練習正確判讀時間，適合學齡前、低年級學童或特教生。",
  alternates: {
    canonical: (process.env.NEXT_PUBLIC_SITE_URL || "https://teachbox100.com") + pages["clock-current-time"].path,
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
