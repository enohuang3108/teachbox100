import { appInfo } from "@/app/pages.config";
import { Background } from "@/components/atoms/Background";
import { FaviconButton } from "@/components/atoms/FaviconButton";
import { WarningIcon } from "@/components/atoms/icons/warning";
import { PostHogProvider } from "@/components/PostHogProvider";
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Noto_Sans_TC, Nunito } from "next/font/google";
import Script from "next/script";
import type React from "react";

// Nunito 負責拉丁字母與數字（圓潤幾何），Noto Sans TC 補中文字重
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

// 中文字檔大，不預載，交給 swap 後補
const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-tc",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://teachbox100.com"),
  manifest: "/manifest.json",
  // 分頁列用白底圓角磚：透明背景的 icon 在深色瀏覽器介面上會整個消失
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/favicon-180.png",
  },
  title: appInfo.title,
  description: appInfo.description,
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://teachbox100.com",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FDFCF8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html lang="zh-TW">
        {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={process.env.NEXT_PUBLIC_UMAMI_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
        {/* overflow-x-hidden：背景色球會刻意出血到畫面外，不能讓它撐出橫向捲軸 */}
        <body
          className={`${nunito.variable} ${notoSansTC.variable} font-sans m-0 overflow-x-hidden p-0`}
        >
          <div className="hidden noscript:block">
            <div className="fixed inset-0 bg-yellow-50 z-50 flex items-center justify-center p-4">
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="mb-4">
                  <WarningIcon className="mx-auto h-12 w-12 text-yellow-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  需要啟用 JavaScript
                </h2>
                <p className="text-gray-600 mb-4">
                  此應用程式需要 JavaScript
                  才能正常運作。請在您的瀏覽器設定中啟用 JavaScript。
                </p>
                <p className="text-sm text-gray-500">
                  This application requires JavaScript to function properly.
                  Please enable JavaScript in your browser settings.
                </p>
              </div>
            </div>
          </div>
          <div className="block noscript:hidden">
            <PostHogProvider>
              <FaviconButton />
              <Background />
              {children}
            </PostHogProvider>
          </div>
        </body>
      </html>
    </ViewTransitions>
  );
}
