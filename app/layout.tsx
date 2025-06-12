import { appInfo } from "@/app/pages.config";
import { Background } from "@/components/atoms/Background";
import { FaviconButton } from "@/components/atoms/FaviconButton";
import { PostHogProvider } from "@/components/PostHogProvider";
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Inter } from "next/font/google";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: {
    icon: appInfo.imageSrc,
  },
  title: appInfo.title,
  description: appInfo.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html lang="zh-TW">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#2563eb" />
          <link rel="icon" href="/icons/icon-192x192.png" />
        </head>
        <body className={inter.className + " m-0 overflow-scroll p-0"}>
          <PostHogProvider>
            <FaviconButton />
            <Background />
            {children}
          </PostHogProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
