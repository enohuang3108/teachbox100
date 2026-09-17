import { pages, type Page } from "@/app/pages.config";
import { CURRICULUM, pageSeo } from "@/lib/seo-content";
import { getUnitIllustrationSrc } from "@/lib/unit-illustration";
import { Link } from "next-view-transitions";
import Image from "next/image";

/**
 * 單元下方的說明、課綱對應、FAQ 與其他教材。
 * 遊戲本體是 client component，爬蟲拿到的 HTML 只有這段文字，
 * 所以必須留在 server 端渲染，不能包成互動元件。
 * 走 PageTemplate 的單元自動有；大富翁這種滿版遊戲在 layout 自己掛。
 */
export function UnitSeoSection({
  pageKey,
  page,
  withIntro = true,
}: {
  pageKey: string;
  page: Page;
  /** 大富翁把介紹搬進頁首 hero，這裡只留 FAQ 與其他教材 */
  withIntro?: boolean;
}) {
  const seo = pageSeo[pageKey];
  if (!seo) return null;
  const others = Object.entries(pages).filter(([k]) => k !== pageKey);

  return (
    <section className="border-ink/10 mx-auto mt-20 w-full max-w-4xl border-t pt-12">
      {/* 用去背版封面直接站在紙上，不加底板也不加框 —— 有框就變成
          「又一張卡片」，插畫本身的剪影才是這裡想要的重點。
          多數單元用 warm 封面對應的 cutout 圖；已有透明 PNG 的單元直接指定它。 */}
      {withIntro && (
        <div className="flex flex-col-reverse gap-6 md:flex-row md:items-start md:gap-8">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-ink text-2xl font-extrabold">
              關於「{page.title}」
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-[1.9]">
              {page.intro}
            </p>
            {/* 練習重點只對有課綱對應的教材單元有意義；計時器、計分板這類
              課堂工具沒有「要練什麼」，列出來只是灌水 */}
            {seo.curriculum && (
              <dl className="text-muted-foreground mt-4 flex flex-col gap-1.5 text-sm leading-[1.8]">
                <div className="flex gap-2">
                  <dt className="text-ink-soft shrink-0 font-semibold">
                    練習重點
                  </dt>
                  <dd>{seo.teaches}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-ink-soft shrink-0 font-semibold">
                    108 課綱
                  </dt>
                  <dd>
                    <ul className="flex flex-col gap-1">
                      {seo.curriculum.map((code) => (
                        <li key={code}>
                          <span className="text-ink font-semibold">{code}</span>{" "}
                          {CURRICULUM[code]}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            )}
          </div>
          <div className="relative aspect-[4/3] w-full shrink-0 md:w-64">
            <Image
              fill
              src={getUnitIllustrationSrc(page)}
              sizes="(max-width: 768px) 92vw, 256px"
              alt=""
              className="object-contain"
            />
          </div>
        </div>
      )}

      <h2
        className={`font-display text-ink text-2xl font-extrabold ${withIntro ? "mt-12" : ""}`}
      >
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
  );
}
