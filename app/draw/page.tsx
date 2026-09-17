import { hubs, pages } from "@/app/pages.config";
import { PageDecor } from "@/components/atoms/PageDecor";
import { ImageCard } from "@/components/molecules/ImageCard";
import { PageTitleBar } from "@/components/molecules/PageTitleBar";
import {
  getBreadcrumbSchema,
  getBreadcrumbTrail,
  getFaqSchema,
  getHubSchema,
} from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";

export const metadata: Metadata = buildMetadata("draw");

const HUB_KEY = "draw";

/**
 * 抽籤分類頁：工具卡片讓老師依演出方式挑選。
 * 跟認識金錢的分類頁不同，這裡沒有先後順序，所以不列「學習順序」。
 */
export default function DrawHubPage() {
  const hub = hubs[HUB_KEY];
  const seo = pageSeo[HUB_KEY];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getHubSchema(HUB_KEY)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema(HUB_KEY)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqSchema(HUB_KEY)) }}
      />

      {/* 麵包屑跟教材頁走同一條列；asHeading 關掉，h1 留給內文的大標 */}
      <PageTitleBar trail={getBreadcrumbTrail(HUB_KEY)} siblings={[]} asHeading={false} />

      <main className="relative min-h-screen">
        <PageDecor />

        <div className="mx-auto w-full max-w-4xl px-5 pt-8 pb-20 md:px-8">
          <h1 className="font-display text-ink text-hero">
            {hub.title}
          </h1>
          <p className="text-muted-foreground mt-5 text-lg leading-[1.85]">{hub.intro}</p>

          <h2 className="font-display text-ink mt-14 text-2xl font-extrabold">選一個開始</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {hub.children.map((key, i) => {
              const page = pages[key];
              return (
                <li key={key}>
                  <ImageCard
                    imageSrc={page.imageSrc}
                    blurDataURL={page.blurDataURL}
                    cardTitle={page.title}
                    cardDescription={page.description}
                    link={page.path}
                    index={i}
                  />
                </li>
              );
            })}
          </ul>

          <h2 className="font-display text-ink mt-14 text-2xl font-extrabold">常見問題</h2>
          <div className="mt-4 flex flex-col gap-2">
            {seo.faq.map((item) => (
              <details key={item.q} className="bg-paper-warm border-ink/10 rounded-2xl border px-5 py-4">
                <summary className="text-ink cursor-pointer font-semibold">{item.q}</summary>
                <p className="text-muted-foreground mt-3 text-base leading-[1.9]">{item.a}</p>
              </details>
            ))}
          </div>

          <h2 className="font-display text-ink mt-14 text-2xl font-extrabold">其他主題</h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {Object.entries(pages)
              .filter(([key]) => !hub.children.includes(key))
              .map(([key, page]) => (
                <li key={key}>
                  <Link
                    href={page.path}
                    className="bg-sand text-ink-soft hover:text-ink inline-flex rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </main>
    </>
  );
}
