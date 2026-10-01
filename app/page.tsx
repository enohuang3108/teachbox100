import { getUnitIllustrationSrc } from "@/lib/unit-illustration";
import { hubs, pages } from "@/app/pages.config";
import {
  FACT_BADGE,
  OfflineGuideDialog,
} from "@/components/atoms/OfflineGuideDialog";
import { PageDecor } from "@/components/atoms/PageDecor";
import { ParallaxFallback } from "@/components/atoms/ParallaxFallback";
import {
  HomeCatalog,
  type CatalogEntry,
} from "@/components/home/HomeCatalog";
import { HeroToolbox } from "@/components/home/HeroToolbox";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/jsonld";
import { Link } from "next-view-transitions";
import Image from "next/image";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-5 md:px-8";

// 首頁卡片依 GSC 近 30 天搜尋點擊排序（同分比曝光），分類頁算旗下所有單元的總和。
// 依據 2026-09-29 的數據（docs/seo/history.md）；沒列到的單元照 pages.config 順序排在後面。
const HOME_ORDER = [
  "draw",
  "noise",
  "memory",
  "coin",
  "clock-current-time",
  "monopoly",
  "quiz-territory",
  "scoreboard",
];
const homeRank = (key: string) => {
  const rank = HOME_ORDER.indexOf(key);
  return rank === -1 ? HOME_ORDER.length : rank;
};

export default function Home() {
  const websiteSchema = getWebsiteSchema();
  const organizationSchema = getOrganizationSchema();
  // hub 取代旗下子頁：首頁只露一張入口卡，權重集中到分類頁而不是散給六張教材卡
  // 例外：爬格子分組太常用，除了抽籤分類也在首頁露一張卡
  const grouped = new Set(
    Object.values(hubs)
      .flatMap((hub) => hub.children)
      .filter((key) => key !== "ladder"),
  );
  const entries: CatalogEntry[] = [
    ...Object.entries(hubs),
    ...Object.entries(pages).filter(([key]) => !grouped.has(key)),
  ]
    .sort(([a], [b]) => homeRank(a) - homeRank(b))
    .map(([key, page]) => ({
      key,
      path: page.path,
      title: page.title,
      slogan: page.slogan,
      art: getUnitIllustrationSrc(page),
    }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <main className="relative min-h-screen">
        <PageDecor />
        <ParallaxFallback />

        {/* Hero */}
        {/* 手機有 header 佔位，桌機才需要讓出左上角浮動 logo 的高度 */}
        <section className={`${CONTAINER} pt-8 pb-14 md:pt-28 md:pb-20`}>
          <div className="grid items-center gap-10 lg:grid-cols-[7fr_5fr] lg:gap-12">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <h1 className="font-display text-ink">
                <span className="block text-display">
                  TeachBox100
                </span>
                <span className="mt-3 block text-h1 text-ink-soft">
                  從遊戲開始，把知識留下
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-lg leading-[1.75] text-muted-foreground lg:mx-0 lg:text-xl">
                {/* 中文沒有斷詞，靠 br 讓桌機版斷在句號而不是把「能力」拆開 */}
                認識新臺幣、看懂時鐘、算出找零。
                <br className="hidden lg:inline" />
                把生活裡真的用得到的能力，變成孩子玩得下去、能夠學習的小遊戲。
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
                <a
                  href="#games"
                  className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-base font-bold text-paper transition-transform duration-150 ease-out active:scale-[0.97]"
                >
                  開始探索
                </a>
                <Link
                  href="/monopoly"
                  prefetch={true}
                  className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-base font-bold text-ink ring-1 ring-ink/15 transition-[background-color,transform] duration-150 ease-out hover:bg-sand active:scale-[0.97]"
                >
                  玩玩大富翁
                </Link>
              </div>
            </div>

            {/* 關著的教具箱，點一下打開 */}
            <div className="order-1 mx-auto w-full max-w-[400px] lg:order-2 lg:max-w-none">
              <HeroToolbox />
            </div>
          </div>
        </section>

        {/* 教材 */}
        <section
          id="games"
          className={`${CONTAINER} scroll-mt-8 pb-20 md:pb-28`}
        >
          <div className="max-w-2xl">
            <h2 className="font-display text-h2 text-ink">
              選一個有興趣的開始吧！
            </h2>
          </div>

          <HomeCatalog entries={entries} />
        </section>

        {/* Footer */}
        <footer className="relative border-t border-ink/10 bg-paper-warm">
          <div
            className={`${CONTAINER} flex flex-col items-center gap-6 py-12 text-center md:flex-row md:justify-between md:py-14 md:text-left`}
          >
            <div className="flex items-center gap-4">
              {/* 頁尾用趴姿：橫向剪影跟這條橫帶版型合，也讀得出「到底了」 */}
              <Image
                src="/images/mascot/barkley-lying.webp"
                alt=""
                aria-hidden
                width={160}
                height={160}
                className="size-20 shrink-0 object-contain"
              />
              <p className="max-w-sm text-base leading-[1.75] text-muted-foreground">
                如果有人想知道的話，這隻狗狗叫做阿黃。
              </p>
            </div>

            <ul className="flex flex-wrap justify-center gap-2.5">
              <li className={FACT_BADGE}>完全免費</li>
              {/* 這顆點得下去，會開安裝說明 */}
              <li>
                <OfflineGuideDialog />
              </li>
              <li className={FACT_BADGE}>
                <Link
                  href="/about"
                  className="underline decoration-2 underline-offset-4"
                >
                  關於我們
                </Link>
              </li>
            </ul>
          </div>
        </footer>
      </main>
    </>
  );
}
