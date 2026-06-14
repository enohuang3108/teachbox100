import { getBreadcrumbSchema, getLearningResourceSchema } from "@/lib/jsonld";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "教學大富翁 | 題庫桌遊 | TeachBox100 台灣互動學習平台",
  description:
    "可匯入自訂題庫的教學大富翁，答對才能買地、蓋房，搭配機會命運卡、擲骰問答與互動關卡，最多 20 人同樂，讓學生在遊戲中複習各科知識。",
  openGraph: {
    title: "教學大富翁 | 題庫桌遊 | TeachBox100",
    description:
      "匯入自訂題庫、答對才能買地蓋房的教學大富翁，最多 20 人同樂的課堂互動遊戲。",
    url: "/monopoly",
    type: "website",
    locale: "zh_TW",
  },
  twitter: {
    card: "summary_large_image",
    title: "教學大富翁 | TeachBox100",
    description:
      "匯入自訂題庫、答對才能買地蓋房的教學大富翁，最多 20 人同樂的課堂互動遊戲。",
  },
  alternates: {
    canonical: "/monopoly",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 大富翁為滿版互動遊戲，無法套用 PageTemplate，故在 layout 直接注入結構化資料
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
