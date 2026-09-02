import type { Metadata } from "next";

// PWA 離線 fallback，不該被索引（robots.ts 也擋了一次）
export const metadata: Metadata = {
  title: "離線模式",
  robots: { index: false, follow: false },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
