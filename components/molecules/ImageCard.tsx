import { Link } from "next-view-transitions";
import Image from "next/image";

const CATEGORIES = {
  money: { label: "金錢", color: "var(--brand-yellow)" },
  time: { label: "時間", color: "var(--brand-blue)" },
  mixed: { label: "綜合", color: "var(--brand-green)" },
} as const;

// 從路徑推分類，不必在 pages.config 多養一個欄位
const categoryOf = (link: string) => {
  if (link.startsWith("/coin")) return CATEGORIES.money;
  if (link.startsWith("/clock")) return CATEGORIES.time;
  return CATEGORIES.mixed;
};

type CardProps = {
  imageSrc: string;
  blurDataURL: string;
  cardTitle: string;
  cardDescription: string;
  link: string;
  /** 在格線中的序位，用來做進場 stagger */
  index?: number;
  button?: React.ReactNode;
};

const FALLBACK_BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=";

export const ImageCard = ({
  imageSrc,
  blurDataURL,
  cardTitle,
  cardDescription,
  link,
  index = 0,
  button,
}: CardProps) => {
  const category = categoryOf(link);

  return (
    <Link
      href={link}
      prefetch={true}
      style={{ animationDelay: `${index * 45}ms` }}
      className="card-enter group flex w-full flex-col rounded-[1.25rem] bg-card p-2 ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_8px_24px_-6px_rgb(2_13_21/0.14)] active:scale-[0.985] active:duration-150"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[0.875rem] bg-sand">
        <Image
          fill
          src={imageSrc}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 22vw"
          placeholder="blur"
          blurDataURL={blurDataURL ?? FALLBACK_BLUR}
          alt=""
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <h3 className="font-display text-xl leading-snug font-bold text-card-foreground">
          {cardTitle}
        </h3>
        <p className="mt-1.5 text-sm leading-[1.75] text-muted-foreground">
          {cardDescription}
        </p>

        <div className="mt-4 flex items-center gap-2 pt-1">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm font-semibold tracking-wide text-muted-foreground">
            {category.label}
          </span>
        </div>
      </div>

      {button && <div className="px-2 pb-2">{button}</div>}
    </Link>
  );
};
