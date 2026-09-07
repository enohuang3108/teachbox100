// 卡背：跟封面同一款——深色牌面、兩顆米白大眼。幾何照 scripts/gen-new-covers.py 的 memory() 量的。
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
export const CARD_BACK_INK = "#1f2937";
const CREAM = "#fcfbfc";

export function CardBack() {
  return (
    <svg viewBox="0 0 190 250" aria-hidden className="size-full">
      {[68.4, 121.6].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={105} rx={22} ry={30} fill={CREAM} />
          <circle cx={cx} cy={105} r={11} fill={CARD_BACK_INK} />
        </g>
      ))}
    </svg>
  );
}
