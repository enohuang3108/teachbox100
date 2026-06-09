"use client";

import { Link } from "next-view-transitions";
import Image from "next/image";
import { usePathname } from "next/navigation";

// 部分全螢幕頁面（如大富翁）需要乾淨版面，隱藏左上角 logo
const HIDDEN_PREFIXES = ["/monopoly"];

export const FaviconButton = () => {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <Link href="/" passHref prefetch={true}>
      <div className="fixed top-3 left-3 cursor-pointer">
        <Image
          src="/icons/favicon_transparent.webp"
          alt="TeachBox100"
          width={64}
          height={64}
        />
      </div>
    </Link>
  );
};
