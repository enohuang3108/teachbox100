"use client";

import Image from "next/image";
import Link from "next/link";

export const FaviconButton = () => {
  return (
    <Link href="/" passHref>
      <div className="fixed top-2 left-2 cursor-pointer">
        <Image
          src="/icons/favicon_transparent.webp"
          alt="TeachBox100"
          width={50}
          height={50}
        />
      </div>
    </Link>
  );
};
