import { Background } from "@/components/atoms/Background";
import { FaviconButton } from "@/components/atoms/FaviconButton";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: {
    icon: "/icons/favicon.webp",
  },
  title: "TeachBox100 台灣互動學習平台",
  description: "幫助台灣學生透過互動式遊戲學習",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={inter.className + "m-0 overflow-scroll p-0"}>
        <FaviconButton />
        <Background />
        {children}
      </body>
    </html>
  );
}
