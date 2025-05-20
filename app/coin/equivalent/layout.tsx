import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "等值換算 | 認識金錢 | TeachBox100 台灣互動學習平台",
  description: "學習不同幣值的等值換算，培養生活中的金錢運用能力。",
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
