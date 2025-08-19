/**
 * JSON-LD schema utilities for TeachBox100
 */

import { appInfo, pages } from "@/app/pages.config";

export interface JsonLdSchema {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

const BASE_URL = "https://teachbox100.com";

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
 * Generate breadcrumb list schema
 */
export function getBreadcrumbSchema(pageKey: string): JsonLdSchema {
  const page = pages[pageKey];
  if (!page) return {} as JsonLdSchema;

  const breadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home page",
      "item": BASE_URL
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": page.title,
      "item": `${BASE_URL}${page.path}`
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs
  };
}
