import { appInfo } from "@/app/pages.config";
import { Background } from "@/components/atoms/Background";
import { FaviconButton } from "@/components/atoms/FaviconButton";
import { WarningIcon } from "@/components/atoms/icons/warning";
import { PostHogProvider } from "@/components/PostHogProvider";
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Inter } from "next/font/google";
import Head from "next/head";
import Script from "next/script";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: {
    icon: appInfo.imageSrc,
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html lang="zh-TW">
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ffffff" />
          <link rel="icon" href="/icons/favicon.png" />
        </Head>
        {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={process.env.NEXT_PUBLIC_UMAMI_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
        <body className={inter.className + " m-0 overflow-scroll p-0"}>
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
