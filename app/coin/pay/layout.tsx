import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "學習付款 | 認識金錢 | TeachBox100 台灣互動學習平台",
  description: "台灣互動式付款模擬遊戲，幫助孩子學習如何使用硬幣正確付款，培養實際生活中的金錢使用能力，透過互動練習提升計算與決策能力。",
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
