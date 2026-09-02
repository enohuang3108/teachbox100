"use client";

import { pages } from "@/app/pages.config";
import { FeedbackButton } from "@/components/atoms/FeedbackButton";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { usePathname } from "next/navigation";

// 大富翁要乾淨版面；教材頁的 logo 已經在 PageTitleBar 裡，兩種都不再放一份
const HIDDEN_PREFIXES = ["/monopoly"];
const UNIT_PATHS = new Set(Object.values(pages).map((p) => p.path));

const Logo = ({ size }: { size: number }) => (
  <Link href="/" passHref prefetch={true} aria-label="回到首頁">
    <Image
      src="/icons/logo-transparent.webp"
      alt="TeachBox100"
      width={size}
      height={size}
      className="cursor-pointer"
    />
  </Link>
);

export const AppChrome = () => {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;
  if (pathname && UNIT_PATHS.has(pathname)) return null;

  return (
    <>
      {/* 手機：實心 header 佔位。浮動元素會壓到卡片標題，小螢幕沒有空間可以讓 */}
      <header className="border-ink/8 bg-paper sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] md:hidden">
        <div className="flex items-center justify-between px-3 py-1.5">
          <Logo size={44} />
          <FeedbackButton className="bg-ink text-paper cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-bold transition-transform duration-150 ease-out active:scale-[0.97]" />
        </div>
      </header>

      {/* 桌機：版面夠寬，維持浮在四角 */}
      <div className="fixed top-3 left-3 z-30 hidden md:block">
        <Logo size={64} />
      </div>
      <FeedbackButton className="bg-ink text-paper fixed top-4 right-4 z-40 hidden cursor-pointer rounded-full px-4 py-2.5 text-sm font-bold transition-transform duration-150 ease-out active:scale-[0.97] md:block" />
    </>
  );
};
