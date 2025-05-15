import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "學習找零 | 認識金錢 | TeachBox100 台灣互動學習平台",
  description: "台灣互動式找零遊戲，模擬商店找零情境，培養兒童正確計算與找零能力，透過實用趣味的方式學習基礎數學與金錢運用，提升生活中的實用技能。",
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
