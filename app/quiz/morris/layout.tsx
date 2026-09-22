import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata("quiz-morris");

export default function MorrisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
