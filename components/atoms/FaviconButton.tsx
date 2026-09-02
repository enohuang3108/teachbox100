"use client";

import { pages } from "@/app/pages.config";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { usePathname } from "next/navigation";

// 部分全螢幕頁面（如大富翁）需要乾淨版面，隱藏左上角 logo
const HIDDEN_PREFIXES = ["/monopoly"];

// 教材頁的 logo 已經在 PageTitleBar 裡，這裡不能再放一顆
const UNIT_PATHS = new Set(Object.values(pages).map((p) => p.path));

export const FaviconButton = () => {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;
  if (pathname && UNIT_PATHS.has(pathname)) return null;

  return (
    <Link href="/" passHref prefetch={true}>
      <div className="fixed top-3 left-3 cursor-pointer">
        <Image
          src="/icons/logo-transparent.webp"
          alt="TeachBox100"
          width={64}
          height={64}
        />
      </div>
    </Link>
  );
};
