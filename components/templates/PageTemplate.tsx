import { siblingsOf, type PageWithKey } from "@/app/pages.config";
import {
  getBreadcrumbSchema,
  getBreadcrumbTrail,
  getFaqSchema,
  getLearningResourceSchema,
} from "@/lib/jsonld";
import { UnitSeoSection } from "@/components/organisms/UnitSeoSection";
import { PageTitleBar } from "../molecules/PageTitleBar";

/** 全螢幕的目標元素；樣式在 styles/globals.css 的 #game-stage:fullscreen */
export const GAME_STAGE_ID = "game-stage";

export const PageTemplate = ({
  page,
  children,
  actions,
}: {
  page: PageWithKey;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) => {
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
      <PageTitleBar trail={trail} siblings={siblings} actions={actions} />
      {/* 扣掉 PageTitleBar 的 h-16，短頁面才不會多出一截捲動 */}
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

        <UnitSeoSection pageKey={key} page={page} />
      </main>
    </>
  );
};
