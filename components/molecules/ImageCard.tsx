import Image from "next/image";
import Link from "next/link";

type CardProps = {
  imageSrc: string;
  blurDataURL: string;
  cardTitle: string;
  cardDescription: string;
  cardWidth?: number;
  link: string;
  button?: React.ReactNode;
};

export const ImageCard = ({
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
      className={`rounded-xl w-[${cardWidth}px] bg-zinc-50 overflow-hidden pb-3 border border-zinc-200`}
    >
      <div className="overflow-hidden relative aspect-video ">
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
      <div className="px-2 text-zinc-900 sm:px-4 py-0 sm:pb-3 text-start">
        <h3 className="text-lg font-bold mt-3 mb-1">{cardTitle}</h3>
        <p className="text-sm leading-5">{cardDescription}</p>
      </div>
      {button && <div className="px-2">{button}</div>}
    </Link>
  );
};
