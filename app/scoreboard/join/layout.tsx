import type { Metadata } from "next";

// 學生端的臨時頁面，沒有獨立內容，不要進索引
export const metadata: Metadata = {
  title: "加入搶答｜TeachBox100",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
