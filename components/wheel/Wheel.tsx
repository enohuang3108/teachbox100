"use client";

import { sliceAngle, sliceColors } from "@/lib/wheel/game";
import { cn } from "@/lib/utils";

const R = 200; // viewBox 半徑
const LABEL_R = 186; // 文字外緣半徑
const HUB_R = 34;

/** 格數越多字越小、字越少；投影時遠處要看得到，寧可截字也不要縮到看不見 */
function labelStyle(count: number) {
  if (count <= 8) return { size: 24, chars: 8 };
  if (count <= 16) return { size: 17, chars: 7 };
  if (count <= 30) return { size: 12, chars: 6 };
  return { size: 8, chars: 5 };
}

const clip = (s: string, n: number) => {
  const chars = Array.from(s);
  return chars.length > n ? chars.slice(0, n - 1).join("") + "…" : s;
};

const polar = (deg: number, r: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [R + r * Math.cos(rad), R + r * Math.sin(rad)] as const;
};

/** 從 12 點鐘起、順時針第 i 格的扇形 */
function slicePath(i: number, slice: number) {
  const [x1, y1] = polar(i * slice, R);
  const [x2, y2] = polar((i + 1) * slice, R);
  const large = slice > 180 ? 1 : 0;
  return `M${R} ${R} L${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
}

// 黃底用墨色字，其他三色用紙色字
const TEXT_ON = { yellow: "var(--ink)", red: "var(--paper)", blue: "var(--paper)", green: "var(--paper)" } as const;

export function Wheel({
  labels,
  rotation,
  spinMs,
  spinning,
  disabled,
  onSpin,
}: {
  labels: string[];
  rotation: number;
  spinMs: number;
  spinning: boolean;
  disabled: boolean;
  onSpin: () => void;
}) {
  const count = labels.length;
  const slice = sliceAngle(count);
  const colors = sliceColors(count);
  const { size, chars } = labelStyle(count);

  return (
    <button
      type="button"
      aria-label={spinning ? "轉動中" : "轉動轉盤"}
      disabled={disabled || spinning}
      onClick={onSpin}
      className={cn(
        "wheel-button mx-auto block w-full max-w-[min(72vh,34rem)] rounded-full",
        "transition-transform duration-150 ease-out active:scale-[0.985] disabled:active:scale-100",
      )}
    >
      <svg viewBox={`0 0 ${R * 2} ${R * 2}`} className="block h-auto w-full overflow-visible">
        <g
          className="wheel-disc"
          style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${spinMs}ms` }}
        >
          {labels.map((label, i) => {
            const mid = (i + 0.5) * slice;
            // 左半邊的字沿半徑排會倒過來，翻 180° 改從外緣往中心讀，字就是正的
            const left = mid > 180;
            return (
              <g key={i}>
                <path d={slicePath(i, slice)} fill={`var(--brand-${colors[i]})`} />
                <text
                  transform={`rotate(${mid - 90 + (left ? 180 : 0)} ${R} ${R})`}
                  x={left ? R - LABEL_R : R + LABEL_R}
                  y={R}
                  textAnchor={left ? "start" : "end"}
                  dominantBaseline="central"
                  fontSize={size}
                  fontWeight={700}
                  fill={TEXT_ON[colors[i]]}
                  className="font-display select-none"
                >
                  {clip(label, chars)}
                </text>
              </g>
            );
          })}
        </g>
        {/* 中心鈕與指標不跟著轉。指標是一塊實心墨色三角，從頂端咬進輪子 */}
        <circle cx={R} cy={R} r={HUB_R} fill="var(--paper)" />
        <text
          x={R}
          y={R}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={26}
          fontWeight={900}
          fill="var(--ink)"
          className="font-display select-none"
        >
          轉
        </text>
        <path d={`M${R - 16} -6 L${R + 16} -6 L${R} 30 Z`} fill="var(--ink)" />
      </svg>
    </button>
  );
}
