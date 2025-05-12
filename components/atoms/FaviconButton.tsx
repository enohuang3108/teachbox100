"use client";

import Image from "next/image";
import Link from "next/link";

export const FaviconButton = () => {
  return (
    <Link href="/" passHref>
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
