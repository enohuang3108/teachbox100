"use client";

import { siblingsOf, type PageWithKey } from "@/app/pages.config";
import {
  getBreadcrumbSchema,
  getBreadcrumbTrail,
  getFaqSchema,
  getLearningResourceSchema,
} from "@/lib/jsonld";
import { UnitHero } from "@/components/organisms/UnitHero";
import { UnitSeoSection } from "@/components/organisms/UnitSeoSection";
import { pageSeo } from "@/lib/seo-content";
import { useState } from "react";
import { PageTitleBar } from "../molecules/PageTitleBar";

/** 全螢幕的目標元素；樣式在 styles/globals.css 的 #game-stage:fullscreen */
export const GAME_STAGE_ID = "game-stage";

export const PageTemplate = ({
  page,
  children,
  actions,
  landing,
}: {
  page: PageWithKey;
  children: React.ReactNode;
  actions?: React.ReactNode;
  /** 給了就先只顯示介紹頁（說明＋FAQ），按開始鈕才換成內容；內容頁不再掛 SEO 區塊 */
  landing?: {
    startLabel: string;
    onStart?: () => void;
    /** 要先開設定再進內容時由頁面控制；不給就是按下開始鈕立刻進 */
    entered?: boolean;
  };
}) => {
  const [enteredState, setEntered] = useState(!landing);
  const entered = landing?.entered ?? enteredState;
  const key = String(page.key);
  const learningResourceSchema = getLearningResourceSchema(key);
  const breadcrumbSchema = getBreadcrumbSchema(key);
  const faqSchema = getFaqSchema(key);
  const trail = getBreadcrumbTrail(key);
  const siblings = siblingsOf(key);

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
      <PageTitleBar
        trail={trail}
        siblings={siblings}
        actions={entered ? actions : undefined}
      />
      {!entered && landing && (
        <div className="px-4 pb-20 md:px-8">
          <UnitHero
            page={page}
            intro={pageSeo[key]?.intro ?? ""}
            startLabel={landing.startLabel}
            onStart={() => {
              setEntered(true);
              window.scrollTo({ top: 0 });
              landing.onStart?.();
            }}
          />
          <UnitSeoSection pageKey={key} page={page} withIntro={false} />
        </div>
      )}
      {/* 扣掉 PageTitleBar 的 h-16，短頁面才不會多出一截捲動 */}
      {entered && (
        <main className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center p-4 md:p-8">
          {/* 全螢幕只吃這一塊：頂列與下面的 SEO／FAQ 不在子樹裡，自然不會出現 */}
          <div
            id={GAME_STAGE_ID}
            data-unit={key}
            className="mx-auto w-full max-w-4xl"
          >
            {/* 全螢幕時整塊等比縮小到塞得下，縮放比例由 FullscreenButton 寫進 --fs-scale */}
            <div data-stage-inner>
              {page.guide && (
                <p className="text-muted-foreground mt-2 mb-6 text-lg">
                  {page.guide}
                </p>
              )}
              <div className="w-full">{children}</div>
            </div>
          </div>

          {!landing && <UnitSeoSection pageKey={key} page={page} />}
        </main>
      )}
    </>
  );
};
