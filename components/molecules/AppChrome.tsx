"use client";

import { hubs, pages } from "@/app/pages.config";
import { FeedbackButton } from "@/components/atoms/FeedbackButton";
import { OpenShareLinkButton } from "@/components/molecules/OpenShareLinkButton";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { usePathname } from "next/navigation";

// 教材頁與分類頁的 logo 已經在 PageTitleBar 裡，不再放一份。
// 學生的搶答頁也不要：那支手機只有一顆按鈕的任務，logo 與意見回饋都是干擾。
const BARE_PATHS = new Set([
  ...Object.values(pages).map((p) => p.path),
  ...Object.values(hubs).map((h) => h.path),
  "/scoreboard/join",
]);

// 回饋是實心主鈕；分享連結是次要入口，用跟首頁「玩玩大富翁」同一套淡框藥丸，不搶回饋的份量
const PILL =
  "bg-ink text-paper cursor-pointer rounded-full font-bold transition-transform duration-150 ease-out active:scale-[0.97]";
const SOFT_PILL =
  "bg-paper text-ink ring-1 ring-ink/15 hover:bg-sand cursor-pointer rounded-full font-bold transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]";

const Logo = ({ size }: { size: number }) => (
  <Link href="/" passHref prefetch={true} aria-label="回到首頁">
    <Image
      src="/icons/logo-transparent.webp"
      alt="TeachBox100"
      width={size}
      height={size}
      className="site-logo cursor-pointer"
    />
  </Link>
);

export const AppChrome = () => {
  const pathname = usePathname();
  if (pathname && BARE_PATHS.has(pathname)) return null;

  return (
    <>
      {/* 手機：實心 header 佔位。浮動元素會壓到卡片標題，小螢幕沒有空間可以讓 */}
      <header className="border-ink/8 bg-paper sticky top-0 z-(--z-overlay) border-b pt-[env(safe-area-inset-top)] md:hidden">
        <div className="flex items-center justify-between px-3 py-1.5">
          <Logo size={44} />
          <div className="flex items-center gap-2">
            <OpenShareLinkButton className={`${SOFT_PILL} px-3.5 py-2 text-[13px]`} label="使用分享連結" />
            <FeedbackButton className={`${PILL} px-3.5 py-2 text-[13px]`} />
          </div>
        </div>
      </header>

      {/* 桌機：版面夠寬，維持浮在四角 */}
      <div className="fixed top-3 left-3 z-(--z-header) hidden md:block">
        <Logo size={64} />
      </div>
      <div className="fixed top-4 right-4 z-(--z-overlay) hidden items-center gap-2 md:flex">
        <OpenShareLinkButton className={`${SOFT_PILL} px-4 py-2.5 text-sm`} label="使用分享連結" />
        <FeedbackButton className={`${PILL} px-4 py-2.5 text-sm`} />
      </div>
    </>
  );
};
