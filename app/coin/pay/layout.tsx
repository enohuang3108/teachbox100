import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata("coin-pay");

// 不在 layout 預載 3D 模型：介紹頁就會把 26 個 .glb（約 11MB）全抓下來，出題時只用得到幾個
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
