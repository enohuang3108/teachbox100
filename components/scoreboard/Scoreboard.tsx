"use client";

import {
  STEPS,
  teamHue,
  toneStyle,
  type Team,
  useScoreboardStore,
} from "@/lib/scoreboard/store";
import { useSound } from "@/lib/hooks/useSound";
import {
  clearOrder,
  onBuzz,
  setOpen,
  useBuzzStore,
} from "@/lib/scoreboard/buzz";
import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * 分數變動時輕輕彈一下。
 * 用 transition + 一個短暫的 scale 狀態，不用 keyframes：
 * 老師會連按，keyframes 每次都得從頭跑，transition 可以中途改目標值。
 */
function Score({ value }: { value: number }) {
  const [bumped, setBumped] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setBumped(true);
    const t = setTimeout(() => setBumped(false), 140);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <span
      data-score-value
      className={`text-ink pointer-events-none block min-w-[2ch] text-center text-6xl leading-none font-bold tabular-nums transition-transform duration-150 ease-out ${
        bumped ? "scale-110" : "scale-100"
      }`}
    >
      {value}
    </span>
  );
}

/** 卡片左下角的扣分鈕。加分是點卡片本身，這裡只留減。 */
function MinusButton({ team, step }: { team: Team; step: number }) {
  const score = useScore();
  return (
    <button
      type="button"
      aria-label={`${team.name} 減 ${step} 分`}
      onClick={() => score(team.id, -step)}
      className="text-ink-soft hover:bg-ink/[0.06] hover:text-ink relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]"
    >
      <Minus size={22} />
    </button>
  );
}

/**
 * 全螢幕時依組數與畫面比例挑欄數。
 * 固定 minmax 的欄寬在 10 組時會排成 7 欄 × 2 列，卡片變成細長條；
 * 這裡改成試算每一種欄數，取「卡片最大且最接近目標長寬比」的那個。
 * 格線高度由 CSS 決定（flex:1），不隨欄數變，所以量測不會跟版面互相追著跑。
 */
const CARD_RATIO = 1.4; // 卡片理想的寬 / 高

function useFullscreenColumns(
  count: number,
  ref: RefObject<HTMLElement | null>,
) {
  const [cols, setCols] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      if (!document.fullscreenElement) return setCols(null);
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      const gap = 12;
      let best = 1;
      let bestSize = 0;
      for (let c = 1; c <= count; c++) {
        const r = Math.ceil(count / c);
        const cw = (w - (c - 1) * gap) / c;
        const ch = (h - (r - 1) * gap) / r;
        // 卡片在目標比例下實際能長多大，取瓶頸那一邊
        const size = Math.min(cw / CARD_RATIO, ch);
        if (size > bestSize) {
          bestSize = size;
          best = c;
        }
      }
      setCols(best);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.addEventListener("fullscreenchange", measure);
    return () => {
      ro.disconnect();
      document.removeEventListener("fullscreenchange", measure);
    };
  }, [count, ref]);

  return cols;
}

/** 加減分 + 對應音效；音效關掉時只改分數 */
function useScore() {
  const addScore = useScoreboardStore((s) => s.addScore);
  const sound = useScoreboardStore((s) => s.sound);
  const { playAddSound, playSubtractSound } = useSound();

  return (id: number, delta: number) => {
    addScore(id, delta);
    if (!sound) return;
    (delta > 0 ? playAddSound : playSubtractSound)();
  };
}

/** 領先那組的皇冠：平塗剪影，跟站上插圖同一種語言。斜掛在卡片右上角。 */
function Crown() {
  return (
    <svg
      data-score-crown
      viewBox="0 0 24 20"
      aria-hidden="true"
      className="text-brand-yellow pointer-events-none absolute -top-2 -right-2 h-[20%] max-h-7 min-h-4 w-auto rotate-20"
    >
      {/* 一體成形：三個尖角連著冠身與底座，圓珠的圓心落在尖端上，接縫才不會露出來 */}
      <path
        fill="currentColor"
        d="M2.6 6.2 7.2 11 12 3.8 16.8 11l4.6-4.8-1.3 8.6H3.9L2.6 6.2Z"
      />
      <circle cx="2.6" cy="6.2" r="2" fill="currentColor" />
      <circle cx="12" cy="3.8" r="2.2" fill="currentColor" />
      <circle cx="21.4" cy="6.2" r="2" fill="currentColor" />
      <rect
        x="3.2"
        y="14.6"
        width="17.6"
        height="3.4"
        rx="1.5"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 連線搶答的控制列 + 按鈴順序。沒開連線就整條不出現，
 * 沒用這個功能的老師看到的計分板跟以前一模一樣。
 */
function BuzzBar() {
  const { code, open, order } = useBuzzStore();
  const { playBonusSound } = useSound();
  const sound = useScoreboardStore((s) => s.sound);

  // 有人按鈴就叮一聲；只有第一個按的才叫，後面的跟著響會蓋掉重點
  useEffect(
    () => onBuzz((rank) => rank === 1 && sound && playBonusSound()),
    [sound, playBonusSound],
  );

  if (!code) return null;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/*
        一顆鈕走完一輪：開始搶答 → 搶答中（按一下停） → 下一題（清順序再開放）。
        以前「停止 → 清除順序 → 再開始」要按三次，出十題就是三十次。
      */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2.5 rounded-full border px-6 py-2.5 text-lg font-bold transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
          open
            ? "bg-brand-yellow border-brand-yellow text-ink"
            : "bg-ink border-ink text-paper"
        }`}
      >
        {/* 開放中才有的呼吸點：投影到教室後面，光看顏色分不出開沒開 */}
        {open && (
          <span className="relative flex size-2.5">
            <span className="bg-ink/40 absolute inline-flex size-full animate-ping rounded-full" />
            <span className="bg-ink relative inline-flex size-2.5 rounded-full" />
          </span>
        )}
        {open ? "搶答中，按此停止" : order.length > 0 ? "下一題" : "開始搶答"}
      </button>

      {order.length > 0 && (
        <ol className="flex flex-wrap items-center justify-center gap-2">
          {order.map((b, i) => (
            <li
              key={b.id}
              // 名次一個個進場，眼睛跟得上誰先誰後
              style={{ animationDelay: `${i * 50}ms` }}
              className={`animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex items-center gap-2 rounded-full border px-4 py-1.5 text-base font-semibold duration-200 ease-out ${
                i === 0
                  ? "bg-brand-yellow/25 border-brand-yellow text-ink text-xl"
                  : "bg-paper-warm border-ink/10 text-ink-soft"
              }`}
            >
              <span className="tabular-nums opacity-60">{i + 1}</span>
              {b.name}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function Scoreboard() {
  const { teams, step, setStep, hueSeed, tone } = useScoreboardStore();
  const score = useScore();
  const top = Math.max(...teams.map((t) => t.score));
  const gridRef = useRef<HTMLDivElement>(null);
  const cols = useFullscreenColumns(teams.length, gridRef);

  return (
    <div data-score-root className="flex flex-col items-center gap-6">
      <BuzzBar />

      <fieldset className="flex items-center gap-2">
        <legend className="sr-only">一次加減幾分</legend>
        <span className="text-ink-soft mr-1 text-base">一次</span>
        {STEPS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={step === n}
            onClick={() => setStep(n)}
            className={`rounded-full border px-4 py-1.5 text-base font-semibold tabular-nums transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
              step === n
                ? "bg-ink border-ink text-paper"
                : "bg-paper-warm border-ink/10 text-ink-soft hover:text-ink"
            }`}
          >
            {n} 分
          </button>
        ))}
      </fieldset>

      <div
        ref={gridRef}
        style={
          cols
            ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }
            : undefined
        }
        data-score-grid
        className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        {/* 連線模式剛開房、還沒人掃進來：格子是空的，給一句話交代在等什麼 */}
        {teams.length === 0 && (
          <p className="text-ink-soft col-span-full py-16 text-center text-lg">
            等學生掃 QR 加入，加一個就多一格。
          </p>
        )}
        {teams.map((t, i) => {
          // 並列第一就一起亮；全部 0 分時不亮，開場整片高亮沒有資訊量
          const leading = top > 0 && t.score === top;
          const colors = toneStyle(tone, teamHue(hueSeed, i));
          return (
            <div
              key={t.id}
              data-score-card
              style={colors}
              className="relative flex touch-manipulation flex-col items-center gap-2 rounded-2xl border p-4 select-none transition-[border-color,transform] duration-200 ease-out has-[button:active]:scale-[0.99]"
            >
              {leading && <Crown />}
              {/* 加分區鋪滿整張卡：上課要能隨手一點就加分，不用瞄準小按鈕。
                  卡面上的名字與分數都是純顯示、不可選取，連按不會反白或誤觸編輯；
                  改名走設定面板。只有扣分鈕靠 z-10 疊在上面。 */}
              <button
                type="button"
                aria-label={`${t.name} 加 ${step} 分`}
                onClick={() => score(t.id, step)}
                className="absolute inset-0 rounded-2xl"
              />
              <span
                data-score-name
                className="text-ink-soft pointer-events-none w-full truncate py-1 text-center text-xl font-semibold"
              >
                {t.name}
              </span>
              <Score value={t.score} />
              <div
                data-score-foot
                className="flex w-full items-center justify-between"
              >
                <MinusButton team={t} step={step} />
                {/* 提示這張卡點下去會加分；圖示不吃點擊，點到它一樣是加分 */}
                <span className="text-ink-soft/60 pointer-events-none flex items-center gap-1 pr-2 text-sm font-semibold tabular-nums">
                  <Plus size={16} />
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
