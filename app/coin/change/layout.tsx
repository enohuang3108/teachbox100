import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "認識錢幣與鈔票",
  description: "認識錢幣與鈔票",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
