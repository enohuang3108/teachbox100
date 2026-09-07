// 卡背：跟封面同一款——阿黃同色的黑牌面（插畫色板 black）、兩顆 paper-warm 大眼。幾何照封面量的。
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
export const CARD_BACK_INK = "#0D0D0D";
const CREAM = "#F8F0E3";

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
