import type { Metadata, Viewport } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "TeachBox100 台灣互動學習平台",
  description: "幫助台灣學生透過互動式遊戲學習",
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
