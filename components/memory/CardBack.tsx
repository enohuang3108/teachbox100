// 卡背：預設跟封面同一款——阿黃同色的黑牌面（插畫色板 black）、兩顆 paper-warm 大眼。幾何照封面量的。
// 其餘六款是品牌色的紙感花紋，自己畫的 SVG，投影放大不糊、跟著 token 走。
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
import { BRAND } from "@/lib/design-tokens";
import { useId } from "react";

export const CARD_BACK_INK = "#0D0D0D";
const CREAM = BRAND.paperWarm;

/** id 存在老師的裝置上，改名會讓舊設定退回預設 */
export const CARD_BACKS = [
  { id: "barkley", label: "預設" },
  { id: "dots", label: "圓點" },
  { id: "stripes", label: "斜紋" },
  { id: "gingham", label: "格紋" },
  { id: "waves", label: "波浪" },
  { id: "zigzag", label: "鋸齒" },
  { id: "flowers", label: "花朵" },
] as const;

export const findBack = (id: string) =>
  CARD_BACKS.find((b) => b.id === id) ?? CARD_BACKS[0];

/** 梅花：五片圓花瓣繞著花心，tile 裡錯開放兩朵 */
const PLUM_CENTERS = [
  [15, 15],
  [45, 45],
] as const;
const PETALS = [0, 1, 2, 3, 4].map((i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return [Math.cos(a) * 6.8, Math.sin(a) * 6.8] as const;
});

/** 每款：底色＋花紋 tile（tile 尺寸、內容） */
const PATTERNS: Record<
  string,
  { bg: string; size: [number, number]; tile: React.ReactNode }
> = {
  dots: {
    bg: "var(--brand-yellow)",
    size: [40, 40],
    tile: (
      <g fill={CREAM} opacity={0.55}>
        <circle cx={10} cy={10} r={6} />
        <circle cx={30} cy={30} r={6} />
      </g>
    ),
  },
  stripes: {
    bg: "var(--brand-blue)",
    size: [28, 28],
    tile: (
      <path
        d="M-7 7 L7 -7 M0 28 L28 0 M21 35 L35 21"
        stroke={CREAM}
        strokeWidth={6}
        opacity={0.35}
      />
    ),
  },
  gingham: {
    bg: "var(--brand-red)",
    size: [40, 40],
    tile: (
      <g fill={CREAM}>
        <rect width={20} height={40} opacity={0.22} />
        <rect width={40} height={20} opacity={0.22} />
      </g>
    ),
  },
  waves: {
    bg: "var(--brand-green)",
    size: [48, 24],
    tile: (
      <path
        d="M0 16 Q12 4 24 16 T48 16"
        fill="none"
        stroke={CREAM}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.45}
      />
    ),
  },
  zigzag: {
    bg: "var(--brand-yellow)",
    size: [40, 20],
    tile: (
      <path
        d="M0 15 L10 5 L20 15 L30 5 L40 15"
        fill="none"
        stroke={CREAM}
        strokeWidth={4}
        strokeLinejoin="round"
        opacity={0.6}
      />
    ),
  },
  flowers: {
    bg: "var(--brand-red)",
    size: [60, 60],
    tile: PLUM_CENTERS.map(([cx, cy]) => (
      <g key={cx}>
        <g fill={CREAM} opacity={0.6}>
          {PETALS.map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={cy + dy} r={5.6} />
          ))}
        </g>
        <circle cx={cx} cy={cy} r={2.8} fill="var(--brand-yellow)" />
      </g>
    )),
  },
};

/** 卡背整面（含底色），外層負責圓角與尺寸；slice 讓全螢幕撐開的格子也鋪滿 */
export function CardBack({ id }: { id: string }) {
  const patternId = useId();
  const back = findBack(id);

  if (back.id === "barkley") {
    return (
      <svg
        viewBox="0 0 190 250"
        aria-hidden
        className="size-full"
        style={{ backgroundColor: CARD_BACK_INK }}
      >
        {[68.4, 121.6].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={105} rx={22} ry={30} fill={CREAM} />
            <circle cx={cx} cy={105} r={11} fill={CARD_BACK_INK} />
          </g>
        ))}
      </svg>
    );
  }

  const p = PATTERNS[back.id];
  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="size-full"
    >
      <defs>
        <pattern
          id={patternId}
          width={p.size[0]}
          height={p.size[1]}
          patternUnits="userSpaceOnUse"
        >
          {p.tile}
        </pattern>
      </defs>
      <rect x={-100} y={-100} width={500} height={600} fill={p.bg} />
      {/* 內框：像撲克牌那樣留一圈素面，花紋只在框裡 */}
      <rect
        x={22}
        y={22}
        width={256}
        height={356}
        rx={18}
        fill={`url(#${patternId})`}
        stroke={CREAM}
        strokeWidth={6}
        strokeOpacity={0.85}
      />
    </svg>
  );
}
