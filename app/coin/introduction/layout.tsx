import { pages } from "@/app/pages.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: pages["coin-change"].title,
  description: pages["coin-change"].description,
  viewport: "width=device-width, initial-scale=1.0",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
