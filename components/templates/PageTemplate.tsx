import { pages, siblingsOf, type PageWithKey } from "@/app/pages.config";
import {
  getBreadcrumbSchema,
  getBreadcrumbTrail,
  getFaqSchema,
  getLearningResourceSchema,
} from "@/lib/jsonld";
import { pageSeo } from "@/lib/seo-content";
import { Link } from "next-view-transitions";
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
  const seo = pageSeo[key];
  const trail = getBreadcrumbTrail(key);
  const siblings = siblingsOf(key);
  // 遊戲本體是 client component，爬蟲拿到的 HTML 只有這段文字，
  // 所以 intro / FAQ 必須留在 server 端渲染，不能包成互動元件。
  const others = Object.entries(pages).filter(([k]) => k !== key);

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

        {seo && (
          <section className="border-ink/10 mx-auto mt-20 w-full max-w-4xl border-t pt-12">
            <h2 className="font-display text-ink text-2xl font-extrabold">
              關於「{page.title}」
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-[1.9]">
              {seo.intro}
            </p>

            <h2 className="font-display text-ink mt-12 text-2xl font-extrabold">
              常見問題
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              {seo.faq.map((item) => (
                <details
                  key={item.q}
                  className="bg-paper-warm border-ink/10 rounded-2xl border px-5 py-4"
                >
                  <summary className="text-ink cursor-pointer font-semibold">
                    {item.q}
                  </summary>
                  <p className="text-muted-foreground mt-3 text-base leading-[1.9]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>

            <h2 className="font-display text-ink mt-12 text-2xl font-extrabold">
              其他教材
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {others.map(([key, other]) => (
                <li key={key}>
                  <Link
                    href={other.path}
                    className="bg-sand text-ink-soft hover:text-ink inline-flex rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
};
