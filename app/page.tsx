import { pages } from "@/app/pages.config";
import { PageDecor } from "@/components/atoms/PageDecor";
import { ParallaxFallback } from "@/components/atoms/ParallaxFallback";
import { ImageCard } from "@/components/molecules/ImageCard";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/jsonld";
import { Link } from "next-view-transitions";
import Image from "next/image";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-5 md:px-8";

const FACTS = ["適合 4–12 歲", "免安裝、可離線使用", "完全免費"];

export default function Home() {
  const websiteSchema = getWebsiteSchema();
  const organizationSchema = getOrganizationSchema();
  const entries = Object.entries(pages);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <main className="relative min-h-screen">
        <PageDecor />
        <ParallaxFallback />

        {/* Hero */}
        {/* pt-24：讓出左上角固定 logo 的高度，手機上狗頭才不會被壓到 */}
        <section className={`${CONTAINER} pt-24 pb-14 md:pt-28 md:pb-20`}>
          <div className="grid items-center gap-10 lg:grid-cols-[7fr_5fr] lg:gap-12">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <h1 className="font-display text-ink">
                <span className="block text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.02] font-black tracking-[-0.03em]">
                  TeachBox100
                </span>
                <span className="mt-3 block text-[clamp(1.5rem,3.2vw,2.25rem)] leading-[1.3] font-bold text-ink-soft">
                  玩中學，學得住
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-lg leading-[1.75] text-muted-foreground lg:mx-0 lg:text-xl">
                {/* 中文沒有斷詞，靠 br 讓桌機版斷在句號而不是把「能力」拆開 */}
                認識新臺幣、看懂時鐘、算出找零。
                <br className="hidden lg:inline" />
                把生活裡真的用得到的能力，做成孩子按得下去、老師改得動的小遊戲。
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

            {/* Barkley 疊在黃球前面；地面陰影讓他站得住，不會像浮在空中 */}
            <div className="order-1 mx-auto w-full max-w-[340px] lg:order-2 lg:max-w-[440px]">
              <div className="relative aspect-square">
                <Image
                  src="/images/decor/blob-yellow.webp"
                  alt=""
                  aria-hidden
                  width={640}
                  height={640}
                  sizes="(max-width: 1024px) 60vw, 30vw"
                  className="blob-float absolute top-[2%] right-[1%] w-[66%]"
                  style={{ animationDuration: "24s", animationDelay: "-4s" }}
                />
                <div className="absolute bottom-[7%] left-1/2 h-[5%] w-[52%] -translate-x-1/2 rounded-[50%] bg-ink/10 blur-md" />
                <Image
                  src="/images/mascot/barkley.webp"
                  alt="TeachBox100 吉祥物 Barkley"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 440px"
                  className="relative object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 教材 */}
        <section id="games" className={`${CONTAINER} scroll-mt-8 pb-20 md:pb-28`}>
          <div className="max-w-2xl">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight font-extrabold tracking-[-0.01em] text-ink">
              選一個開始玩
            </h2>
            <p className="mt-2 text-base leading-[1.75] text-muted-foreground">
              每個都能直接開始，不用註冊、不用安裝。
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {entries.map(([key, page], index) => (
              <ImageCard
                key={key}
                index={index}
                link={page.path}
                imageSrc={page.imageSrc}
                blurDataURL={page.blurDataURL}
                cardTitle={page.title}
                cardDescription={page.description}
              />
            ))}
          </div>
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
                適合學齡前至國小學生，以及特教班的日常生活技能練習。
              </p>
            </div>

            <ul className="flex flex-wrap justify-center gap-2.5">
              {FACTS.map((fact) => (
                <li
                  key={fact}
                  className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink-soft"
                >
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </main>
    </>
  );
}
