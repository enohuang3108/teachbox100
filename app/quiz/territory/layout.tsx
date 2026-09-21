import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata("quiz-territory");

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
