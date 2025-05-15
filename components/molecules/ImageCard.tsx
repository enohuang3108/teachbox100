import { Link } from "next-view-transitions";
import Image from "next/image";

type CardProps = {
  pageKey: string;
  imageSrc: string;
  blurDataURL: string;
  cardTitle: string;
  cardDescription: string;
  cardWidth?: number;
  link: string;
  button?: React.ReactNode;
};

export const ImageCard = ({
  pageKey,
  imageSrc,
  blurDataURL,
  cardTitle,
  cardDescription,
  cardWidth = 300,
  link,
  button,
}: CardProps) => {
  return (
    <Link
      href={link}
      prefetch={true}
      className={`rounded-xl transition-all duration-300 hover:scale-105 w-[${cardWidth}px] overflow-hidden border border-zinc-200 bg-zinc-50 pb-3`}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          fill
          src={imageSrc}
          placeholder="blur"
          blurDataURL={
            blurDataURL ??
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII="
          }
          alt="image"
        />
      </div>
      <div className="px-2 py-0 text-start text-zinc-900 sm:px-4 sm:pb-3">
        <h3 className={`mt-3 mb-1 text-lg font-bold vt-${pageKey}-title`}>{cardTitle}</h3>
        <p className="text-sm leading-5">{cardDescription}</p>
      </div>
      {button && <div className="px-2">{button}</div>}
    </Link>
  );
};
