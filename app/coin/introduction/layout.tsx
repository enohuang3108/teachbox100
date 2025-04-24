import { pages } from "@/app/pages.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: pages["coin-introduction"].title,
  description: pages["coin-introduction"].description,
  viewport: "width=device-width, initial-scale=1.0",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
