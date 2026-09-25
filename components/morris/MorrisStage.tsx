"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { MorrisVictory } from "./MorrisVictory";
import {
  countPieces,
  optionsOf,
  type Lane,
  type Side,
} from "@/lib/morris/game";
import { cn } from "@/lib/utils";
import { Check, Circle, X } from "lucide-react";
import type { MorrisGame } from "./useMorrisGame";

const SIDE_COLOR: Record<Side, string> = {
  red: "text-brand-red",
  blue: "text-brand-blue",
};
const SIDE_BG: Record<Side, string> = {
  red: "bg-brand-red",
  blue: "bg-brand-blue",
};
const SIDE_BORDER: Record<Side, string> = {
  red: "border-brand-red",
  blue: "border-brand-blue",
};

export function MorrisStage({
  game,
  names,
  sound,
  onSettings,
}: {
  game: MorrisGame;
  names: [string, string];
  sound: boolean;
  onSettings: () => void;
}) {
  const { state } = game;
  const nameOf = (side: Side) =>
    side === "red" ? names[0] || "紅隊" : names[1] || "藍隊";

  return (
    <div
      data-morris-board
      className="@container relative min-h-[52rem] w-full overflow-hidden rounded-2xl border border-border bg-paper md:aspect-video md:min-h-0"
    >
      <div className="grid h-full gap-3 p-3 md:grid-cols-[minmax(0,1fr)_40cqw_minmax(0,1fr)] md:gap-[1.4cqw] md:p-[1.4cqw]">
        <QuestionLane
          side="red"
          name={nameOf("red")}
          lane={state.lanes.red}
          game={game}
          nameOf={nameOf}
        />
        <Board game={game} nameOf={nameOf} />
        <QuestionLane
          side="blue"
          name={nameOf("blue")}
          lane={state.lanes.blue}
          game={game}
          nameOf={nameOf}
        />
      </div>

      {state.phase === "over" && state.result && state.result !== "draw" && (
        <div className="absolute inset-0 z-10">
          <MorrisVictory
            winner={state.result}
            winnerName={nameOf(state.result)}
            sound={sound}
            onRestart={game.restart}
            onSettings={onSettings}
          />
        </div>
      )}
      {state.phase === "over" && state.result === "draw" && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-paper/80 p-4">
          <dialog
            open
            aria-labelledby="morris-result-title"
            className="relative m-0 w-[min(100%,36rem)] rounded-2xl border-2 border-ink bg-card px-6 py-8 text-center text-ink shadow-lg md:px-10 md:py-10"
          >
            <p
              id="morris-result-title"
              data-morris-result-title
              className="text-display text-balance text-ink"
            >
              和局
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={game.restart} className="rounded-full active:scale-[0.97]">
                再玩一次
              </Button>
              <Button
                variant="outline"
                onClick={onSettings}
                className="rounded-full active:scale-[0.97]"
              >
                設定
              </Button>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}

function QuestionLane({
  side,
  name,
  lane,
  game,
  nameOf,
}: {
  side: Side;
  name: string;
  lane: Lane;
  game: MorrisGame;
  nameOf: (side: Side) => string;
}) {
  const { state } = game;
  const question = lane.current;
  const disabled = state.phase !== "quiz" || lane.cooldown > 0;
  const answered = lane.feedback;
  const acting = state.phase === "move" && state.movingSide === side;
  const lockedOut = state.phase === "move" && state.movingSide !== side;
  const ready = state.phase === "ready";
  const done = Math.min(lane.index + (question ? 1 : 0), lane.queue.length);
  const options = question ? optionsOf(question) : [];

  return (
    <section
      aria-label={`${name}題目`}
      data-morris-lane={side}
      className={cn(
        "relative flex min-h-0 flex-col rounded-2xl border-[3px] bg-card p-4 shadow-sm md:p-[1.4cqw]",
        SIDE_BORDER[side],
        acting && "morris-action-lane border-transparent",
      )}
    >
      {/* 隊名在左上；進度放到底部，右上角留給全螢幕鈕 */}
      <header className="flex items-center gap-[0.8cqw]">
        <Mark
          side={side}
          className="size-9 md:size-[3.2cqw]"
        />
        <span className={cn("font-display text-[clamp(1.1rem,1.9cqw,2rem)] font-extrabold", SIDE_COLOR[side])}>
          {name}
        </span>
      </header>

      {ready ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[3cqw] text-center">
          <Mark side={side} className="size-[clamp(5rem,9cqw,9rem)]" />
          <Button
            size="lg"
            disabled={state.ready[side]}
            onClick={() => game.markReady(side)}
            className="h-auto min-h-14 min-w-40 rounded-full px-[2.5cqw] py-[1.2cqw] text-[clamp(1.1rem,1.7cqw,1.8rem)] transition-transform duration-press ease-out active:scale-[0.97]"
          >
            {state.ready[side] ? `${name}準備好了 ✓` : `${name}準備好了`}
          </Button>
        </div>
      ) : state.phase === "countdown" ? (
        <LaneMessage title="準備出題" body="倒數結束後，兩隊會同時看到第一題。" />
      ) : lane.exhausted ? (
        <LaneMessage title="題目已答完" body="等待另一隊完成題庫。" />
      ) : lane.waiting || !question ? (
        <LaneMessage title="等對方換題" body="下一題和對方相同，稍等一下。" />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 items-center justify-center py-4">
            <p className="text-center text-[clamp(1.25rem,2.6cqw,3rem)] leading-[1.5] font-bold text-balance text-ink">
              {question.text}
            </p>
          </div>
          {/* 回饋夾在題目與選項之間、位置先留好：選項永遠貼在底部，學生站在電子白板前伸手就按得到 */}
          <div className="min-h-[5rem] md:min-h-[6.5cqw]">
            {answered && (
              <AnswerFeedback
                correct={answered.correct}
                cooldown={lane.cooldown}
                explanation={question.explanation}
              />
            )}
          </div>
          <div className="relative">
              <div
                data-morris-answers={side}
                className={cn(
                  "grid gap-[0.8cqw] transition-opacity duration-hover",
                  // 短選項排成兩欄；長選項一行一個才不會斷得亂七八糟
                  options.every((option) => option.length <= 6) && "grid-cols-2",
                  lockedOut && "opacity-40",
                )}
              >
                {options.map((option, index) => {
                  const isAnswer = option === question.answer;
                  const isPicked = option === answered?.choice;
                  return (
                    <button
                      key={`${option}-${index}`}
                      type="button"
                      disabled={disabled}
                      aria-label={`${name}選 ${option}`}
                      onPointerDown={(event) => {
                        if (event.button !== 0) return;
                        event.preventDefault();
                        game.answer(side, option);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        game.answer(side, option);
                      }}
                      className={cn(
                        "min-h-14 touch-manipulation rounded-xl border-2 px-3 py-2 text-[clamp(1.05rem,1.8cqw,2rem)] font-bold break-words shadow-sm md:min-h-[5cqw]",
                        "transition-[transform,background-color,border-color] duration-press ease-out active:scale-[0.97] disabled:pointer-events-none",
                        !answered && cn(SIDE_BORDER[side], "bg-paper text-ink"),
                        // 答對、選錯用實心紅綠配白字，投影時後排也看得出來；暗色模式的 ink 是淺色
                        answered && isAnswer && "border-success bg-success text-paper dark:text-ink",
                        answered && isPicked && !isAnswer && "quiz-shake border-danger bg-danger text-paper dark:text-ink",
                        answered && !isAnswer && !isPicked && "border-border bg-muted text-muted-foreground",
                        state.phase === "move" && !answered && "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {lockedOut && state.movingSide && !answered && (
                <p className="text-caption pointer-events-none absolute inset-0 grid place-items-center">
                  <span className="rounded-full bg-card px-3 py-1 text-muted-foreground shadow-sm">
                    暫停，等{nameOf(state.movingSide)}下棋
                  </span>
                </p>
              )}
          </div>
        </div>
      )}

      <footer className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-transform duration-slow ease-out origin-left", SIDE_BG[side])}
            style={{ transform: `scaleX(${lane.queue.length ? done / lane.queue.length : 0})` }}
          />
        </div>
        <span className="text-caption text-muted-foreground tabular-nums">
          {done} / {lane.queue.length}
        </span>
      </footer>
    </section>
  );
}

/** 正解已經由轉綠的選項標出來，這裡只講接下來會怎樣，再補解析 */
function AnswerFeedback({
  correct,
  cooldown,
  explanation,
}: {
  correct: boolean;
  cooldown: number;
  explanation?: string;
}) {
  return (
    <div
      data-morris-feedback={correct ? "correct" : "incorrect"}
      aria-live="assertive"
      className="quiz-enter pb-[1cqw]"
    >
      <div className="flex items-center gap-2">
        {correct ? (
          <Check aria-hidden className="size-5 shrink-0 text-success md:size-[1.8cqw]" strokeWidth={3} />
        ) : (
          <X aria-hidden className="size-5 shrink-0 text-danger md:size-[1.8cqw]" strokeWidth={3} />
        )}
        <p className={cn("text-[clamp(1rem,1.5cqw,1.6rem)] font-bold", correct ? "text-success-ink" : "text-danger-ink")}>
          {correct ? "正確" : `答錯了，${cooldown} 秒後換題`}
        </p>
        {correct && (
          <p className="ml-auto text-[clamp(0.85rem,1.2cqw,1.3rem)] text-muted-foreground">取得一個棋步</p>
        )}
      </div>
      {explanation && (
        <p className="mt-2 text-[clamp(0.85rem,1.2cqw,1.3rem)] text-muted-foreground">{explanation}</p>
      )}
    </div>
  );
}

function LaneMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-[clamp(1.25rem,2.4cqw,2.6rem)] font-bold text-ink">{title}</p>
      <p className="mt-2 text-[clamp(0.95rem,1.4cqw,1.5rem)] text-muted-foreground">{body}</p>
    </div>
  );
}

function Board({
  game,
  nameOf,
}: {
  game: MorrisGame;
  nameOf: (side: Side) => string;
}) {
  const { state } = game;
  const moving = state.phase === "move" ? state.movingSide : null;
  const relocating = moving ? countPieces(state.board, moving) >= 3 : false;

  return (
    <section className="order-first flex min-h-0 flex-col items-center justify-center gap-[1.5cqw] rounded-2xl bg-muted p-4 md:order-none md:p-[1.4cqw]">
      {/* 狀態列：誰在下棋一眼看得到，用那一隊的顏色 */}
      <div className="grid min-h-12 place-items-center md:min-h-[5cqw]">
        {state.phase === "countdown" && state.countdown !== null ? (
          <p
            key={state.countdown}
            aria-live="assertive"
            className="territory-count font-display text-[clamp(3rem,8cqw,8rem)] leading-none font-extrabold text-ink"
          >
            {state.countdown}
          </p>
        ) : moving ? (
          <p
            key={moving}
            aria-live="polite"
            className={cn(
              "quiz-enter flex items-center gap-[0.8cqw] rounded-full px-[1.8cqw] py-[0.7cqw] text-[clamp(1rem,1.7cqw,1.9rem)] font-bold text-paper",
              SIDE_BG[moving],
            )}
          >
            <span>
              {!relocating
                ? `${nameOf(moving)}，選一個空格放棋`
                : state.selectedFrom === null
                  ? `${nameOf(moving)}，先點一枚自己的棋`
                  : "再點一個空格放下去"}
            </span>
          </p>
        ) : state.phase === "quiz" ? (
          <p className="text-[clamp(0.95rem,1.4cqw,1.5rem)] text-muted-foreground">答對就能下一步棋</p>
        ) : null}
      </div>

      <div className="relative aspect-square w-[min(100%,22rem)] flex-none md:w-[min(100%,38cqw)]">
        <div
          data-morris-grid
          data-mover={moving ?? undefined}
          className={cn(
            "grid size-full grid-cols-3 grid-rows-3 gap-[3%] rounded-[6%] bg-paper p-[3%] transition-[box-shadow] duration-hover",
            moving && "morris-grid-active",
          )}
        >
          {state.board.map((cell, index) => {
            const selected = state.selectedFrom === index;
            const winning = state.winningLine?.includes(index);
            const hintPlacement = Boolean(moving) && !relocating && cell === null;
            const hintPiece =
              Boolean(moving) && relocating && state.selectedFrom === null && cell === moving;
            const hintDestination =
              Boolean(moving) && relocating && state.selectedFrom !== null && cell === null;
            const hinted = hintPlacement || hintPiece || hintDestination;
            // 搬棋：還沒選時自己的棋都跳，選了之後只剩選到的那枚在跳；其他枚留隊色框，表示還能改選
            const ownPiece = relocating && cell === moving;
            const hopping = ownPiece && (state.selectedFrom === null || selected);
            return (
              <button
                key={index}
                data-morris-cell={index}
                data-action-hint={hinted || undefined}
                type="button"
                aria-label={cell ? `${nameOf(cell)}的棋` : `空格 ${index + 1}`}
                disabled={state.phase !== "move"}
                onClick={() => game.chooseCell(index)}
                className={cn(
                  "relative isolate grid size-full min-h-0 min-w-0 place-items-center overflow-hidden rounded-[14%] bg-secondary transition-[transform,background-color,box-shadow,opacity] duration-press ease-out active:scale-[0.97] disabled:pointer-events-none",
                  ownPiece && "morris-pick-cell",
                  // 搬棋第一步：只有自己的棋是亮的，其他格子退到後面
                  relocating && state.selectedFrom === null && !hintPiece && "opacity-40",
                  selected && "morris-selected-cell",
                  winning && "bg-warning-soft ring-4 ring-warning",
                )}
              >
                {cell ? (
                  <Mark
                    key={cell}
                    side={cell}
                    className={cn(
                      "territory-count pointer-events-none absolute z-10 size-[58%]",
                      hopping && "morris-pick-mark",
                    )}
                  />
                ) : (
                  // 可以下的空格浮出那一隊的淡記號，學生不用猜自己會下成什麼
                  moving &&
                  (hintPlacement || hintDestination) && (
                    <Mark
                      side={moving}
                      className="morris-ghost-mark pointer-events-none absolute z-10 size-[50%]"
                    />
                  )
                )}
              </button>
            );
          })}
        </div>
        {state.phase === "ready" && (
          <p
            data-morris-ready-label
            className="pointer-events-none absolute inset-0 z-10 grid place-items-center text-[clamp(3rem,8.5cqw,9rem)] leading-none font-extrabold text-ink"
          >
            READY?
          </p>
        )}
        {state.winningLine && <WinningStroke line={state.winningLine} />}
      </div>
    </section>
  );
}

function Mark({ side, className }: { side: Side; className?: string }) {
  return side === "red" ? (
    <Circle aria-hidden strokeWidth={3.5} className={cn(SIDE_COLOR.red, className)} />
  ) : (
    <X aria-hidden strokeWidth={3.5} className={cn(SIDE_COLOR.blue, className)} />
  );
}

function WinningStroke({ line }: { line: number[] }) {
  const point = (index: number) => ({
    x: (index % 3) * 33.333 + 16.666,
    y: Math.floor(index / 3) * 33.333 + 16.666,
  });
  const from = point(line[0]);
  const to = point(line[2]);
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100">
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
