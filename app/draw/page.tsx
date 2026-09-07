import { hubs, pages } from "@/app/pages.config";
import { PageDecor } from "@/components/atoms/PageDecor";
import { ImageCard } from "@/components/molecules/ImageCard";
import { getBreadcrumbSchema, getFaqSchema, getHubSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";

export const metadata: Metadata = buildMetadata("draw");

const HUB_KEY = "draw";

/**
 * 抽籤分類頁：兩個工具並排讓老師挑。
 * 跟認識金錢的分類頁不同，這裡沒有先後順序，所以不列「學習順序」，
 * 直接放兩張封面卡，左轉盤右抽籤機。
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

      <main className="relative min-h-screen">
        <PageDecor />

        <div className="mx-auto w-full max-w-4xl px-5 pt-8 pb-20 md:px-8 md:pt-28">
          <nav aria-label="麵包屑">
            <ol className="text-muted-foreground flex gap-2 text-sm">
              <li>
                <Link href="/" className="hover:text-ink underline-offset-4 hover:underline">
                  首頁
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page">{hub.title}</li>
            </ol>
          </nav>

          <h1 className="font-display text-ink mt-6 text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.1] font-black tracking-[-0.02em]">
            {hub.title}
          </h1>
          <p className="text-muted-foreground mt-5 text-lg leading-[1.85]">{seo.intro}</p>

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
