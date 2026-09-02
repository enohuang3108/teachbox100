import { pages, type PageWithKey } from "@/app/pages.config";
import {
  getBreadcrumbSchema,
  getBreadcrumbTrail,
  getFaqSchema,
  getLearningResourceSchema,
} from "@/lib/jsonld";
import { pageSeo } from "@/lib/seo-content";
import { Link } from "next-view-transitions";

export const PageTemplate = ({
  page,
  children,
}: {
  page: PageWithKey;
  children: React.ReactNode;
}) => {
  const key = String(page.key);
  const learningResourceSchema = getLearningResourceSchema(key);
  const breadcrumbSchema = getBreadcrumbSchema(key);
  const faqSchema = getFaqSchema(key);
  const seo = pageSeo[key];
  const trail = getBreadcrumbTrail(key);
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
      <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-16 md:p-8 md:pt-16">
        {/* 麵包屑：對應 BreadcrumbList 結構化資料，Google 要求兩者一致，
            所以連結與文字都從 getBreadcrumbTrail 同一份資料來 */}
        <nav aria-label="麵包屑" className="mx-auto w-full max-w-4xl">
          <ol className="text-muted-foreground flex flex-wrap gap-2 text-sm">
            <li>
              <Link
                href="/"
                className="hover:text-ink underline-offset-4 hover:underline"
              >
                首頁
              </Link>
            </li>
            {trail.map((crumb, i) => (
              <li key={crumb.path} className="flex gap-2">
                <span aria-hidden>/</span>
                {i === trail.length - 1 ? (
                  <span aria-current="page">{crumb.title}</span>
                ) : (
                  <Link
                    href={crumb.path}
                    className="hover:text-ink underline-offset-4 hover:underline"
                  >
                    {crumb.title}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mx-auto w-full max-w-4xl">
          <div className="w-full">
            <h1 className={"mb-8 text-4xl font-bold md:text-5xl lg:text-6xl"}>
              {page.title}
            </h1>
            {page.guide && (
              <p className="text-muted-foreground text-lg">
                <span>{page.guide}</span>
              </p>
            )}
          </div>
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <div className="w-full">{children}</div>
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
