import { FeedbackButton } from "@/components/atoms/FeedbackButton";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { UnitSwitcher, type Sibling } from "./UnitSwitcher";

// 用 CSS 切換而不是判斷寬度：不會有 hydration 前後不一致的閃動
const FEEDBACK_LABEL = (
  <>
    <span className="sm:hidden">回饋</span>
    <span className="hidden sm:inline">使用回饋</span>
  </>
);

export interface Crumb {
  path: string;
  title: string;
}

/**
 * 教材頁頂端的列：logo 貼左、麵包屑接在後面、操作鈕靠右。
 * 麵包屑最後一節就是本頁的 h1，所以內文不再另外放大標題。
 * 手機實心白底（小螢幕內容會從透明頂列後面透出來，糊成一團），桌機維持透明比較輕。
 * min-h 而不是 h：讓 iOS 主畫面 App 的瀏海高度加得進去，不會把內容壓扁。
 */
export const PageTitleBar = ({
  trail,
  siblings,
  actions,
}: {
  trail: Crumb[];
  siblings: Sibling[];
  actions?: React.ReactNode;
}) => (
  <header className="border-ink/8 bg-paper sticky top-0 z-40 flex min-h-16 w-full items-center gap-3 border-b px-3 pt-[env(safe-area-inset-top)] sm:px-5 md:border-0 md:bg-transparent">
    <Link
      href="/"
      prefetch={true}
      aria-label="回首頁"
      className="shrink-0 transition-transform duration-150 ease-out active:scale-[0.97]"
    >
      <Image
        src="/icons/logo-transparent.webp"
        alt="TeachBox100"
        width={36}
        height={36}
        className="site-logo"
        priority
      />
    </Link>

    {/* 麵包屑：對應 BreadcrumbList 結構化資料，Google 要求兩者一致，
        所以連結與文字都從 getBreadcrumbTrail 同一份資料來 */}
    <nav aria-label="麵包屑" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-sm">
        <li>
          <Link
            href="/"
            className="text-ink-soft hover:text-ink rounded px-1 py-0.5 transition-colors duration-150"
          >
            首頁
          </Link>
        </li>
        {trail.map((crumb, i) => (
          <li key={crumb.path} className="flex min-w-0 items-center gap-x-1.5">
            <span aria-hidden className="text-stone select-none">
              /
            </span>
            {i === trail.length - 1 ? (
              <h1 className="text-ink min-w-0 text-sm font-bold">
                <UnitSwitcher
                  title={crumb.title}
                  path={crumb.path}
                  siblings={siblings}
                />
              </h1>
            ) : (
              <Link
                href={crumb.path}
                className="text-ink-soft hover:text-ink truncate rounded px-1 py-0.5 transition-colors duration-150"
              >
                {crumb.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>

    <div className="ml-auto flex shrink-0 items-center gap-0.5">
      {/* 跟旁邊那排圓鈕同一套 ghost 樣式，不用實心藥丸搶走麵包屑的注意力。
          手機只剩「回饋」：這條列上已經有 logo、麵包屑和最多四顆操作鈕 */}
      <FeedbackButton
        label={FEEDBACK_LABEL}
        className="text-ink-soft hover:text-ink hover:bg-ink/[0.06] h-9 cursor-pointer rounded-full px-3 text-[13px] font-bold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]"
      />
      {actions}
    </div>
  </header>
);
