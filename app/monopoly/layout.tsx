import { pages } from "@/app/pages.config";
import { MonopolyGate } from "@/components/monopoly/MonopolyGate";
import { UnitSeoSection } from "@/components/organisms/UnitSeoSection";
import {
  getBreadcrumbSchema,
  getFaqSchema,
  getLearningResourceSchema,
} from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata("monopoly");

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 大富翁為滿版互動遊戲，無法套用 PageTemplate，故在 layout 直接注入結構化資料；
  // 說明與 FAQ 在 server 渲染好交給 MonopolyGate，只在介紹頁出現。
  const learningResourceSchema = getLearningResourceSchema("monopoly");
  const breadcrumbSchema = getBreadcrumbSchema("monopoly");
  const faqSchema = getFaqSchema("monopoly");

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
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <MonopolyGate
        intro={pages.monopoly.intro}
        seo={
          <UnitSeoSection
            pageKey="monopoly"
            page={pages.monopoly}
            withIntro={false}
          />
        }
      >
        {children}
      </MonopolyGate>
    </>
  );
}
