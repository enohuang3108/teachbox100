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
      className="group relative rounded-xl transition-all sm:min-h-[280px] duration-300 hover:scale-[1.02] hover:shadow-lg overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm pb-3 hover:border-primary/30 hover:bg-card"
      style={{ width: cardWidth }}
    >
      <div className="relative aspect-video overflow-hidden">
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
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
      <div className="px-2 py-0 text-start text-card-foreground sm:px-4 sm:pb-3">
        <h3 className="mt-3 mb-1 text-lg font-bold group-hover:text-primary transition-colors duration-200">{cardTitle}</h3>
        <p className="text-sm leading-5 text-muted-foreground group-hover:text-card-foreground/80 transition-colors duration-200">{cardDescription}</p>
      </div>
      {button && <div className="px-2 sm:px-4">{button}</div>}
    </Link>
  );
};
