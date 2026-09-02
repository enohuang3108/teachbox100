import { getBreadcrumbSchema, getLearningResourceSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata("monopoly");

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 大富翁為滿版互動遊戲，無法套用 PageTemplate，故在 layout 直接注入結構化資料。
  // 沒有可見的問答區塊，所以刻意不掛 FAQPage schema。
  const learningResourceSchema = getLearningResourceSchema("monopoly");
  const breadcrumbSchema = getBreadcrumbSchema("monopoly");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(learningResourceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {children}
    </>
  );
}
