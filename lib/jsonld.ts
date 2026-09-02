/**
 * JSON-LD schema utilities for TeachBox100
 */

import { appInfo, hubOf, hubs, pages } from "@/app/pages.config";
import { pageSeo } from "@/lib/seo-content";

export interface JsonLdSchema {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teachbox100.com";

const COMMON_AUDIENCE = [
  {
    "@type": "EducationalAudience",
    "educationalRole": "student",
  },
  {
    "@type": "EducationalAudience",
    "educationalRole": "teacher"
  }
];

/**
 * Generate website schema for the homepage
 */
export function getWebsiteSchema(): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": appInfo.title,
    "description": appInfo.description,
    "url": BASE_URL,
    "inLanguage": "zh-TW",
    "audience": COMMON_AUDIENCE,
    "mainEntityOfPage": {
      "@type": "EducationalOrganization",
      "name": "TeachBox100",
      "description": "台灣互動式教學平台",
      "audience": COMMON_AUDIENCE
    }
  };
}

/**
 * Generate organization schema
 */
export function getOrganizationSchema(): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "TeachBox100",
    "description": appInfo.description,
    "url": BASE_URL,
    "logo": `${BASE_URL}${appInfo.imageSrc}`,
    "inLanguage": "zh-TW",
    "audience": COMMON_AUDIENCE
  };
}

/**
 * Generate learning resource schema for game pages
 */
export function getLearningResourceSchema(pageKey: string): JsonLdSchema {
  const page = pages[pageKey];
  if (!page) return {} as JsonLdSchema;

  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": page.title,
    "description": page.description,
    "url": `${BASE_URL}${page.path}`,
    "image": `${BASE_URL}${page.imageSrc}`,
    "inLanguage": "zh-TW",
    "educationalLevel": "elementary",
    "educationalUse": "instruction",
    "learningResourceType": "interactive game",
    "audience": COMMON_AUDIENCE,
    "isPartOf": {
      "@type": "WebSite",
      "name": appInfo.title,
      "url": BASE_URL
    }
  };
}

/**
 * Generate breadcrumb list schema.
 * 教材頁若隸屬某個分類頁，會插入中間那一層（首頁 / 認識金錢 / 找零）。
 * 傳入 hub key 時則產生兩層（首頁 / 認識金錢）。
 */
export function getBreadcrumbSchema(pageKey: string): JsonLdSchema {
  const trail = getBreadcrumbTrail(pageKey);
  if (!trail.length) return {} as JsonLdSchema;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "首頁", "item": BASE_URL },
      ...trail.map((crumb, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": crumb.title,
        "item": `${BASE_URL}${crumb.path}`,
      })),
    ],
  };
}

/** 麵包屑的中間與末端節點，供 schema 與畫面上的 nav 共用，兩者必須一致 */
export function getBreadcrumbTrail(
  pageKey: string,
): { title: string; path: string }[] {
  const hub = hubs[pageKey];
  if (hub) return [{ title: hub.title, path: hub.path }];

  const page = pages[pageKey];
  if (!page) return [];

  const parent = hubOf(pageKey);
  return [
    ...(parent ? [{ title: parent.title, path: parent.path }] : []),
    { title: page.title, path: page.path },
  ];
}

/**
 * Generate collection page schema for a hub.
 * ItemList 讓搜尋引擎知道這頁底下掛了哪些教材，以及建議的先後順序。
 */
export function getHubSchema(hubKey: string): JsonLdSchema {
  const hub = hubs[hubKey];
  if (!hub) return {} as JsonLdSchema;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": hub.title,
    "url": `${BASE_URL}${hub.path}`,
    "inLanguage": "zh-TW",
    "audience": COMMON_AUDIENCE,
    "isPartOf": {
      "@type": "WebSite",
      "name": appInfo.title,
      "url": BASE_URL,
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": hub.children.length,
      "itemListOrder": "https://schema.org/ItemListOrderAscending",
      "itemListElement": hub.children.map((key, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": pages[key].title,
        "url": `${BASE_URL}${pages[key].path}`,
      })),
    },
  };
}

/**
 * Generate FAQ schema for game pages.
 * 只在頁面上真的有渲染出對應問答時才使用 —— 沒有可見內容的 FAQ 結構化資料
 * 違反 Google 的結構化資料準則。
 */
export function getFaqSchema(pageKey: string): JsonLdSchema | null {
  const seo = pageSeo[pageKey];
  if (!seo?.faq?.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": seo.faq.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a,
      },
    })),
  };
}
