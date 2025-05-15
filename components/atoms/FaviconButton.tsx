import { Link } from "next-view-transitions";
import Image from "next/image";

export const FaviconButton = () => {
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
