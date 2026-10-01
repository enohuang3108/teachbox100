import { FeedbackButton } from "@/components/atoms/FeedbackButton";
import { Link } from "next-view-transitions";
import Image from "next/image";

export type CatalogEntry = {
  key: string;
  path: string;
  title: string;
  slogan: string;
  art: string;
};

/*
 * 「全部」時兩張卡橫跨兩欄，讓每種欄數的格線都剛好排滿、不留缺角：
 * 兩欄 → 抽籤跨欄，意見卡補最後一格；lg 三欄 → 抽籤、大富翁跨欄，意見卡補最後一格；
 * xl 四欄 → 同上，意見卡跨兩欄補滿最後一列。卡片數量變了要重算這裡。
 * 橫式卡跟同列的直式卡共用列高，所以插圖改成撐滿高度；抽籤在 sm 獨佔一列，沒有鄰居可撐，保留 4:3。
 */
type Feature = {
  span: string;
  card: string;
  art: string;
  body: string;
  title: string;
  /** 橫式時才出現的「打開看看」 */
  cta: string;
};
const FEATURE: Record<string, Feature> = {
  draw: {
    span: "col-span-2",
    card: "sm:grid sm:grid-cols-[1.35fr_1fr]",
    art: "aspect-[16/10] sm:aspect-[4/3] sm:rounded-tr-none sm:rounded-l-[14px] lg:aspect-auto lg:h-full",
    body: "sm:justify-center sm:border-t-0 sm:border-l sm:px-8",
    title: "sm:text-h2",
    cta: "sm:inline-flex",
  },
  monopoly: {
    span: "lg:col-span-2",
    card: "lg:grid lg:grid-cols-[1.35fr_1fr]",
    art: "lg:aspect-auto lg:h-full lg:rounded-tr-none lg:rounded-l-[14px]",
    body: "lg:justify-center lg:border-t-0 lg:border-l lg:px-8",
    title: "lg:text-h2",
    cta: "lg:inline-flex",
  },
};

const PRESS =
  "transition-[transform,box-shadow] duration-hover ease-out active:scale-[0.985] active:duration-press";

export function HomeCatalog({ entries }: { entries: CatalogEntry[] }) {
  return (
    <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 md:gap-x-7 md:gap-y-9 lg:grid-cols-3 xl:grid-cols-4">
      {entries.map((entry, index) => {
        const feature = FEATURE[entry.key];
        return (
          <li
            key={entry.key}
            className={`card-enter ${feature?.span ?? ""}`}
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <Link
              href={entry.path}
              prefetch={true}
              className={`group relative flex h-full flex-col rounded-[14px] bg-card ring-1 ring-ink/[0.07] hover:-translate-y-[3px] hover:shadow-[0_14px_30px_-14px_rgb(2_13_21/0.28)] ${PRESS} ${feature?.card ?? ""}`}
            >
              <div
                className={`halftone relative aspect-[4/3] overflow-hidden rounded-t-[14px] ${feature?.art ?? ""}`}
              >
                <Image
                  fill
                  src={entry.art}
                  alt=""
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 26vw"
                  className="object-contain p-[7%] transition-transform duration-hover ease-out group-hover:-translate-y-1"
                />
              </div>
              <div
                className={`flex flex-1 flex-col border-t border-dashed border-ink/12 px-3 pt-3 pb-4 sm:px-5 sm:pt-3.5 sm:pb-5 ${feature?.body ?? ""}`}
              >
                <h3
                  className={`font-display text-xl leading-snug font-bold text-card-foreground ${feature?.title ?? ""}`}
                >
                  {entry.title}
                </h3>
                <p className="mt-1.5 text-sm leading-[1.75] text-pretty text-muted-foreground">
                  {entry.slogan}
                </p>
                {feature && (
                  <span
                    className={`mt-5 hidden items-center gap-1.5 self-start rounded-full bg-ink px-4 py-2 text-caption text-paper ${feature.cta}`}
                  >
                    打開看看
                    <span
                      aria-hidden
                      className="transition-transform duration-hover ease-out group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}

      <li
        className="card-enter xl:col-span-2"
        style={{ animationDelay: `${8 * 40}ms` }}
      >
        <FeedbackButton
          className={`group flex h-full min-h-44 w-full cursor-pointer flex-col items-start justify-between rounded-[14px] border-2 border-dashed border-ink/20 p-6 text-left hover:border-ink/40 ${PRESS}`}
          label={
            <>
              <span>
                <span className="block font-display text-xl leading-snug font-bold text-card-foreground">
                  還缺哪一件教具？
                </span>
                <span className="mt-1.5 block text-sm leading-[1.75] text-pretty text-muted-foreground">
                  告訴阿黃你上課想用什麼，下一個單元可能就是你的點子。
                </span>
              </span>
              <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-caption text-paper">
                寫給我們
                <span aria-hidden>→</span>
              </span>
            </>
          }
        />
      </li>
    </ul>
  );
}
