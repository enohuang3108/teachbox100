import { hubs, pages } from "@/app/pages.config";
import { PageDecor } from "@/components/atoms/PageDecor";
import {
  getBreadcrumbSchema,
  getFaqSchema,
  getHubSchema,
} from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";
import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import Image from "next/image";

export const metadata: Metadata = buildMetadata("coin");

const HUB_KEY = "coin";

export default function CoinHubPage() {
  const hub = hubs[HUB_KEY];
  const seo = pageSeo[HUB_KEY];
  const steps = seo.steps ?? [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getHubSchema(HUB_KEY)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbSchema(HUB_KEY)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getFaqSchema(HUB_KEY)),
        }}
      />

      <main className="relative min-h-screen">
        <PageDecor />

        <div className="mx-auto w-full max-w-4xl px-5 pt-24 pb-20 md:px-8 md:pt-28">
          <nav aria-label="麵包屑">
            <ol className="text-muted-foreground flex gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-ink underline-offset-4 hover:underline"
                >
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
          <p className="text-muted-foreground mt-5 text-lg leading-[1.85]">
            {seo.intro}
          </p>

          {/* 這串順序本身就是這頁最有價值的內容 —— 子頁各自為政，只有這裡說得出先後 */}
          <h2 className="font-display text-ink mt-14 text-2xl font-extrabold">
            建議的學習順序
          </h2>
          <ol className="mt-6 flex flex-col gap-4">
            {steps.map((step, i) => {
              const page = pages[step.pageKey];
              return (
                <li key={step.pageKey}>
                  <Link
                    href={page.path}
                    prefetch={true}
                    className="bg-card group flex gap-4 rounded-[1.25rem] p-3 ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_8px_24px_-6px_rgb(2_13_21/0.14)] active:scale-[0.99]"
                  >
                    <div className="bg-sand relative hidden aspect-[4/3] w-40 shrink-0 overflow-hidden rounded-[0.875rem] sm:block">
                      <Image
                        fill
                        src={page.imageSrc}
                        blurDataURL={page.blurDataURL}
                        placeholder="blur"
                        sizes="160px"
                        alt=""
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center py-1 pr-2">
                      <div className="flex items-baseline gap-2.5">
                        <span className="bg-sand text-ink-soft flex size-6 shrink-0 items-center justify-center self-center rounded-full text-xs font-bold">
                          {i + 1}
                        </span>
                        <h3 className="font-display text-card-foreground text-xl leading-snug font-bold">
                          {page.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm leading-[1.8]">
                        {step.note}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>

          <h2 className="font-display text-ink mt-14 text-2xl font-extrabold">
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

          <h2 className="font-display text-ink mt-14 text-2xl font-extrabold">
            其他主題
          </h2>
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
