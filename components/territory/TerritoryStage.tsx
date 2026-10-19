"use client";

import { useState, type CSSProperties } from "react";
import { DIFFICULTY_LABEL, difficultyOf, type Question } from "@/lib/questions/types";
import {
  cellValue,
  countOf,
  flagsOf,
  optionsOf,
  type Owner,
  type Side,
} from "@/lib/territory/rules";
import { ANSWER_CONTENT, ANSWER_GRID, answerTextClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import type { TerritoryGame } from "./useTerritoryGame";
import { VictoryOverlay } from "./VictoryOverlay";

const OWNER_BG: Record<"left" | "right" | "none", string> = {
  left: "bg-brand-blue",
  right: "bg-brand-red",
  none: "bg-sand",
};
/** 答案鈕白底、粗的隊色框，學生一眼看得出哪一排是自己的 */
const PAD_BORDER: Record<Side, string> = {
  left: "border-brand-blue",
  right: "border-brand-red",
};

/** 暈開時一格接一格換色的間隔；換色本身是 --territory-fill */
const STAGGER_MS = 90;

/**
 * 題目直接寫在領地上，底下是藍是紅都不一定，所以字用墨色、外圈描一層紙色，
 * 比墊一張卡片更像「寫在地圖上」
 */
const HALO: CSSProperties = {
  textShadow:
    "0 0 2px var(--paper), 0 0 4px var(--paper), 0 0 8px var(--paper), 0 0 14px var(--paper)",
};

export function TerritoryStage({
  game,
  names,
  sound,
}: {
  game: TerritoryGame;
  names: [string, string];
  sound: boolean;
}) {
  const { board, question, over, winner, aspect } = game;
  const nameOf = (side: Side) =>
    side === "left" ? names[0] || "藍隊" : names[1] || "紅隊";
  // 直立螢幕的左右太窄，兩隊的鈕改成並排放在題目下方
  const portrait = aspect < 1;
  const flags = flagsOf(board.cols, board.rows);

  return (
    <div
      data-territory-board
      className="@container relative w-full overflow-hidden rounded-2xl border border-border bg-paper"
      style={{ aspectRatio: aspect }}
    >
      {/* 棋盤就是背景，只給眼睛看；讀螢幕器從兩隊標籤讀格數 */}
      <div
        aria-hidden
        className="absolute inset-0 grid gap-[0.4cqw] p-[0.4cqw]"
        style={{
          gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${board.rows}, minmax(0, 1fr))`,
        }}
      >
        {board.cells.map((owner, i) => (
          <Cell
            key={i}
            owner={owner}
            order={game.changed.indexOf(i)}
            flag={flags.includes(i)}
          />
        ))}
      </div>

      {/* 旗子排在答案鈕底下那層：位置跟鈕重疊時，鈕要按得到 */}
      <WallFlag side="left" />
      <WallFlag side="right" />

      <div
        className={cn(
          "absolute inset-0 grid gap-[2cqw] p-[2.5cqw]",
          // 題目在中上方，答案鈕貼著左右兩邊、靠近下方 —— 站在螢幕邊的學生手伸得到
          portrait
            ? "grid-cols-2 grid-rows-[minmax(0,1fr)_auto]"
            : "grid-cols-[minmax(0,23%)_minmax(0,1fr)_minmax(0,23%)]",
        )}
      >
        {!over && !(game.ready.left && game.ready.right) && (
          <>
            <ReadyButton
              side="left"
              game={game}
              name={nameOf("left")}
              className={portrait ? "col-start-1 row-start-2" : "col-start-1 row-start-1 self-end"}
            />
            <ReadyButton
              side="right"
              game={game}
              name={nameOf("right")}
              className={portrait ? "col-start-2 row-start-2" : "col-start-3 row-start-1 self-end"}
            />
          </>
        )}
        {!over && !(game.ready.left && game.ready.right) && (
          <p className="territory-count font-display text-ink col-span-full row-span-full self-center justify-self-center text-[clamp(3rem,13cqw,13rem)] leading-none font-extrabold tracking-wide" style={HALO}>
            READY?
          </p>
        )}
        {question && !over ? (
          <>
            {game.canAnswer && <AnswerPad
              side="left"
              game={game}
              question={question}
              name={nameOf("left")}
              className={portrait ? "col-start-1 row-start-2" : "self-end"}
            />}
            <QuestionText
              game={game}
              question={question}
              nameOf={nameOf}
              className={portrait ? "col-span-2 row-start-1" : "col-start-2 row-start-1"}
            />
            {game.canAnswer && <AnswerPad
              side="right"
              game={game}
              question={question}
              name={nameOf("right")}
              className={portrait ? "col-start-2 row-start-2" : "col-start-3 row-start-1 self-end"}
            />}
          </>
        ) : null}
      </div>

      {over && (
        <VictoryOverlay
          winner={winner}
          winnerName={winner ? nameOf(winner) : ""}
          detail={
            // 吃光時棋盤已經說明一切；題目出完才需要講是比格數分的勝負
            winner && countOf(board, winner === "left" ? "right" : "left") === 0
              ? null
              : `題目出完：${nameOf("left")} ${countOf(board, "left")} 格，${nameOf("right")} ${countOf(board, "right")} 格`
          }
          sound={sound}
          onRestart={game.restart}
        />
      )}
    </div>
  );
}

/**
 * 開局前每隊按一次，站在答案鈕的位置，兩隊都按了才開始倒數。
 * 按下後填滿隊色，另一隊看得出對手已經就位
 */
function ReadyButton({
  side,
  game,
  name,
  className,
}: {
  side: Side;
  game: TerritoryGame;
  name: string;
  className: string;
}) {
  const done = game.ready[side];
  return (
    <button
      type="button"
      disabled={done}
      onClick={() => game.markReady(side)}
      className={cn(
        "flex min-h-[clamp(3.5rem,8cqw,8rem)] touch-manipulation items-center justify-center rounded-[clamp(10px,1.2cqw,20px)] border-[clamp(3px,0.35cqw,6px)] px-[1.2cqw] py-[0.8cqw] shadow-sm",
        "transition-[transform,background-color,color] duration-hover ease-out active:scale-[0.97] disabled:pointer-events-none",
        PAD_BORDER[side],
        done ? cn(OWNER_BG[side], "text-paper") : "bg-card text-ink",
        className,
      )}
    >
      <span className="text-[clamp(1rem,2cqw,2rem)] font-bold">
        {done ? `${name}準備好了 ✓` : `${name}準備好了`}
      </span>
    </button>
  );
}

/**
 * 插在左右牆上的隊旗：黑旗桿斜斜伸出牆面，三角旗面填隊色、描黑邊。
 * 右邊那支是左邊的鏡像。只是裝飾，不給讀螢幕器
 */
function WallFlag({ side }: { side: Side }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 52 48"
      className={cn(
        "pointer-events-none absolute top-[46%] w-[clamp(2.5rem,6cqw,6rem)]",
        side === "left" ? "left-0" : "right-0 -scale-x-100",
      )}
    >
      <path
        d="M34 10 L21 23 L47 33 Z"
        fill={side === "left" ? "var(--brand-blue)" : "var(--brand-red)"}
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M1 46 L36 8"
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 一格。換手時只換底色：同一個 transition 被下一題打斷也會從目前的顏色接著走，
 * 暈開的先後靠 transition-delay 排，不用 keyframes。
 * 顏色變化能幫人看懂局面，所以降低動態效果時照樣保留。
 */
function Cell({
  owner,
  order,
  flag,
}: {
  owner: Owner;
  order: number;
  flag: boolean;
}) {
  const fill: CSSProperties = {
    transitionDuration: "var(--territory-fill)",
    transitionDelay: order >= 0 ? `${order * STAGGER_MS}ms` : "0ms",
  };
  return (
    <div
      className={cn(
        "grid place-items-center rounded-[clamp(4px,1cqw,16px)] transition-[background-color] ease-[ease]",
        OWNER_BG[owner ?? "none"],
      )}
      style={fill}
    >
      {flag && <Flag owner={owner} delay={fill.transitionDelay} />}
    </div>
  );
}

const FLAG_COLOR: Record<"left" | "right" | "none", string> = {
  left: "var(--brand-blue)",
  right: "var(--brand-red)",
  none: "color-mix(in srgb, var(--stone) 80%, var(--ink))",
};

/**
 * 插在格子上的三角旗，開局是灰的。格子換手時舊旗沿著旗桿降下、換成新隊色再升上去，
 * 降旗跟著這格換色的先後排。
 */
function Flag({ owner, delay }: { owner: Owner; delay: CSSProperties["transitionDelay"] }) {
  // 記住上一個主人：換手那一次才播降旗、升旗（render 中比對是 React 建議的寫法）
  const [shown, setShown] = useState(owner);
  const [from, setFrom] = useState<Owner | undefined>(undefined);
  if (owner !== shown) {
    setFrom(shown);
    setShown(owner);
  }
  return (
    <svg
      data-flag={owner ?? "none"}
      aria-hidden
      // 旗桿在 x = 0：viewBox 左右對稱，旗桿就插在格子正中
      viewBox="-36 0 72 48"
      // 紙色外框：插在同隊顏色的格子上也分得出來
      className="h-[42%] overflow-visible [filter:drop-shadow(1.5px_0_0_var(--paper))_drop-shadow(-1.5px_0_0_var(--paper))_drop-shadow(0_1.5px_0_var(--paper))_drop-shadow(0_-1.5px_0_var(--paper))]"
    >
      <g stroke="var(--ink)" strokeLinejoin="round" strokeLinecap="round">
        <path d="M0 45 V3" strokeWidth="3" />
        <g
          key={owner ?? "none"}
          className={from === undefined ? undefined : "flag-swap"}
          style={
            {
              "--from": FLAG_COLOR[from ?? "none"],
              "--to": FLAG_COLOR[owner ?? "none"],
              "--delay": delay,
            } as CSSProperties
          }
        >
          <path className="flag-cloth" strokeWidth="2.5" d="M0 4 L25 12 L0 20 Z" />
        </g>
        <ellipse cx="0" cy="45" rx="7" ry="2.5" strokeWidth="2.5" fill="var(--ink)" />
      </g>
    </svg>
  );
}

function QuestionText({
  game,
  question,
  nameOf,
  className,
}: {
  game: TerritoryGame;
  question: Question;
  nameOf: (side: Side) => string;
  className: string;
}) {
  const { flash } = game;
  const value = cellValue(question);
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-[1.2cqw] self-start pt-[3cqw] text-center",
        className,
      )}
    >
      {/* 換題才重新進場；同一題被另一隊接手時不動 */}
      <div key={`${question.id}-${game.asked}`} className="quiz-enter flex flex-col items-center gap-[1cqw]">
        <p
          aria-hidden
          className="text-ink text-[clamp(1rem,2.2cqw,2.25rem)] leading-none tracking-[0.2em]"
          style={HALO}
        >
          {"●".repeat(value)}
        </p>
        <p
          className="zhuyin-text font-display text-ink text-[clamp(1.25rem,3.8cqw,4rem)] leading-[1.35] font-extrabold text-balance break-words"
          style={HALO}
        >
          {/* 墨點看不到的人要聽得到這題值幾格 */}
          <span className="sr-only">
            {DIFFICULTY_LABEL[difficultyOf(question)]}題，答對暈開 {value} 格。
          </span>
          {question.text}
        </p>
      </div>
      {game.countdown !== null && (
        <div className="flex flex-col items-center gap-2" style={HALO}>
          <p aria-live="assertive" className="font-display text-ink text-[clamp(3rem,10cqw,9rem)] leading-none font-extrabold tabular-nums">
            {game.countdown}
          </p>
        </div>
      )}
      {/* 兩隊都答錯時鈕上沒有顏色可看，正解只能在這裡講；其他結果只給讀螢幕器 */}
      <p
        aria-live="polite"
        className={cn(
          "min-h-[1.75em] rounded-full bg-danger-soft px-[1.6cqw] py-[0.4cqw] text-[clamp(0.9rem,1.7cqw,1.6rem)] font-bold text-danger-ink transition-opacity duration-hover",
          !(flash && !flash.correct && flash.answer) && "opacity-0",
        )}
      >
        {flash && !flash.correct && flash.answer ? (
          `正解是「${flash.answer}」`
        ) : (
          <span className="sr-only">
            {flash
              ? flash.correct
                ? `${nameOf(flash.side)}答對了`
                : `${nameOf(flash.side)}答錯，換${nameOf(
                    flash.side === "left" ? "right" : "left",
                  )}`
              : ""}
          </span>
        )}
      </p>
    </div>
  );
}

/**
 * 一隊的答案鈕，貼著螢幕左右兩邊，兩隊站在螢幕邊就按得到。
 *
 * 用 pointerdown 不用 click：click 在觸控上有相容性延遲，而且同一塊螢幕上兩根手指
 * 同時按時，pointer 事件才會各自帶 pointerId 分別派送。
 */
function AnswerPad({
  side,
  game,
  question,
  name,
  className,
}: {
  side: Side;
  game: TerritoryGame;
  question: Question;
  name: string;
  className: string;
}) {
  const { flash } = game;
  // 規則只記最後答錯的那隊；兩隊都答錯後停留等下一題時，先答錯的那隊也要維持出局，
  // 不然它會亮回來一下，看起來像還能答
  const lockedOut =
    game.lockedOut === side || (game.settling && !!flash && !flash.correct);
  const disabled = !game.canAnswer || game.settling || lockedOut;
  // 答對時兩隊的那個選項都換成答對那隊的顏色，另一隊也看得到正解
  const picked = flash && flash.correct ? flash.choice : null;
  const missed = flash && !flash.correct && flash.side === side;

  return (
    <section
      aria-label={`${name}的答案`}
      className={cn(
        "flex min-w-0 flex-col gap-[1cqw]",
        className,
        // 答錯那一下搖一次頭；同一題不會再按，所以不會被打斷
        missed && "quiz-shake",
      )}
    >
      {/* 畫面上靠底色認隊伍；棋盤對讀螢幕器是隱藏的，格數與出局在這裡講 */}
      <p className="sr-only">
        {lockedOut
          ? `${name}這題出局`
          : `${name}目前 ${countOf(game.board, side)} 格`}
      </p>
      <div className={cn(ANSWER_GRID, "gap-[0.8cqw]")}>
        {optionsOf(question).map((option, i) => (
          <button
            key={option + i}
            type="button"
            disabled={disabled}
            aria-label={`${name}選 ${option}`}
            onPointerDown={(e) => {
              // 滑鼠右鍵與中鍵不算作答
              if (e.button !== 0) return;
              e.preventDefault();
              game.answer(side, option);
            }}
            // pointerdown 收不到鍵盤觸發的按鈕，Tab ＋ Enter 的路徑要自己補回來
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              game.answer(side, option);
            }}
            className={cn(
              ANSWER_CONTENT,
              answerTextClass(option, "board"),
              "flex min-h-[clamp(2.75rem,5.5cqw,6rem)] touch-manipulation items-center justify-center rounded-[clamp(10px,1.2cqw,20px)] border-[clamp(3px,0.35cqw,6px)] px-[1.2cqw] py-[0.6cqw] shadow-sm",
              "transition-[transform,background-color,border-color] duration-press ease-out",
              "active:scale-[0.97] disabled:pointer-events-none",
              option === picked && flash
                ? cn(PAD_BORDER[flash.side], OWNER_BG[flash.side], "text-paper")
                : // 出局不用半透明：鈕底下壓著隊色時會混出第三種顏色，改成不透明的灰
                  lockedOut
                  ? "border-border bg-sand text-muted-foreground"
                  : cn(PAD_BORDER[side], "bg-card text-ink"),
            )}
          >
            <span className="min-w-0 text-center font-bold">
              {option}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
