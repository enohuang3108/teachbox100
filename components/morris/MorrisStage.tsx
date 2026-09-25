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
      <div className="grid h-full gap-3 p-3 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.92fr)_minmax(0,1fr)] md:gap-[1.2cqw] md:p-[1.2cqw]">
        <QuestionLane
          side="red"
          name={nameOf("red")}
          lane={state.lanes.red}
          game={game}
        />
        <Board game={game} nameOf={nameOf} />
        <QuestionLane
          side="blue"
          name={nameOf("blue")}
          lane={state.lanes.blue}
          game={game}
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
}: {
  side: Side;
  name: string;
  lane: Lane;
  game: MorrisGame;
}) {
  const { state } = game;
  const question = lane.current;
  const disabled = state.phase !== "quiz" || lane.cooldown > 0;
  const answered = lane.feedback;
  const acting = state.phase === "move" && state.movingSide === side;
  const lockedOut = state.phase === "move" && state.movingSide !== side;
  const ready = state.phase === "ready";

  return (
    <section
      aria-label={`${name}題目`}
      data-morris-lane={side}
      className={cn(
        "relative flex min-h-0 flex-col rounded-2xl border-[3px] bg-card p-4 shadow-sm md:p-[1.2cqw]",
        SIDE_BORDER[side],
        acting && "morris-action-lane border-transparent",
      )}
    >
      {ready ? (
        <div className="relative flex min-h-0 flex-1 flex-col items-center text-center">
          <span className="text-caption absolute top-0 right-0 text-muted-foreground tabular-nums">
            {Math.min(lane.index + (question ? 1 : 0), lane.queue.length)} / {lane.queue.length}
          </span>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <Mark side={side} className="size-[clamp(5rem,8cqw,8rem)]" />
          </div>
          <Button
            size="lg"
            disabled={state.ready[side]}
            onClick={() => game.markReady(side)}
            className="text-body-lg mb-[6%] h-auto min-h-14 min-w-40 rounded-full px-8 py-4 transition-transform duration-press ease-out active:scale-[0.97]"
          >
            {state.ready[side] ? `${name}準備好了 ✓` : `${name}準備好了`}
          </Button>
        </div>
      ) : (
        <>
          <header className="relative flex min-h-14 items-center justify-center border-b border-border pb-2">
            <Mark
              side={side}
              className={cn("size-12", acting && "morris-action-mark")}
            />
            <span className="text-caption absolute top-0 right-0 text-muted-foreground tabular-nums">
              {Math.min(lane.index + (question ? 1 : 0), lane.queue.length)} / {lane.queue.length}
            </span>
          </header>

          {state.phase === "countdown" ? (
            <LaneMessage title="準備出題" body="倒數結束後，兩隊會同時看到第一題。" />
          ) : lane.exhausted ? (
            <LaneMessage title="題目已答完" body="等待另一隊完成題庫。" />
          ) : lane.waiting || !question ? (
            <LaneMessage title="等對方換題" body="下一題和對方相同，稍等一下。" />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 items-center justify-center px-2 py-4">
                <p className="text-center text-[clamp(1.1rem,2.3cqw,2rem)] leading-[1.55] font-bold text-balance text-ink">
                  {question.text}
                </p>
              </div>
              <div
                data-morris-answers={side}
                className={cn(
                  "grid shrink-0 gap-2 pb-2 transition-opacity duration-hover",
                  // 短選項排成兩欄，高度讓給題目；長選項一行一個才不會斷得亂七八糟
                  optionsOf(question).every((option) => option.length <= 6) && "grid-cols-2",
                  lockedOut && "opacity-40",
                )}
              >
                {optionsOf(question).map((option, index) => {
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
                        "min-h-14 touch-manipulation rounded-xl border-2 px-3 py-2 text-[clamp(1rem,1.5cqw,1.35rem)] font-bold break-words shadow-sm",
                        "transition-[transform,background-color,border-color] duration-press ease-out active:scale-[0.97] disabled:pointer-events-none",
                        !answered && cn(SIDE_BORDER[side], "bg-paper text-ink"),
                        answered && isAnswer && "border-success bg-success-soft text-success-ink",
                        answered && isPicked && !isAnswer && "quiz-shake border-danger bg-danger-soft text-danger-ink",
                        answered && !isAnswer && !isPicked && "border-border bg-muted text-muted-foreground",
                        state.phase === "move" && !answered && "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {/* 回饋的位置先留好，答題後題目與選項不會被往上擠 */}
              <div className="min-h-[5.5rem]">
                {answered && (
                  <AnswerFeedback
                    correct={answered.correct}
                    cooldown={lane.cooldown}
                    explanation={question.explanation}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
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
      className="quiz-enter mt-3 border-t border-border pt-3"
    >
      <div className="flex items-center gap-2">
        {correct ? (
          <Check aria-hidden className="size-5 shrink-0 text-success" strokeWidth={3} />
        ) : (
          <X aria-hidden className="size-5 shrink-0 text-danger" strokeWidth={3} />
        )}
        <p className={cn("text-body", correct ? "text-success-ink" : "text-danger-ink")}>
          {correct ? "正確" : `答錯了，${cooldown} 秒後換題`}
        </p>
        {correct && (
          <p className="text-caption ml-auto text-muted-foreground">取得一個棋步</p>
        )}
      </div>
      {explanation && <p className="text-caption mt-2 text-muted-foreground">{explanation}</p>}
    </div>
  );
}

function LaneMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-h3 text-ink">{title}</p>
      <p className="mt-2 text-body text-muted-foreground">{body}</p>
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
  const moving = state.movingSide;
  const relocating = moving ? countPieces(state.board, moving) >= 3 : false;

  return (
    <section className="order-first flex min-h-0 flex-col items-center justify-center rounded-2xl bg-muted p-4 md:order-none md:p-[1.2cqw]">
      <div className="mb-3 min-h-12 text-center">
        {state.phase === "countdown" && state.countdown !== null ? (
          <p
            key={state.countdown}
            aria-live="assertive"
            className="territory-count font-display text-[clamp(3rem,8cqw,6rem)] leading-none font-extrabold text-ink"
          >
            {state.countdown}
          </p>
        ) : state.phase === "move" && moving ? (
          <p className={cn("text-h3", SIDE_COLOR[moving])}>
            {nameOf(moving)}，{relocating ? "選一枚棋，再選空格" : "選一個空格放棋"}
          </p>
        ) : null}
      </div>

      <div className="relative aspect-square w-[min(100%,22rem)] flex-none">
        <div
          data-morris-grid
          className="grid size-full grid-cols-3 grid-rows-3 gap-2 rounded-2xl bg-paper p-2"
        >
          {state.board.map((cell, index) => {
            const selected = state.selectedFrom === index;
            const winning = state.winningLine?.includes(index);
            const hintPlacement =
              state.phase === "move" && Boolean(moving) && !relocating && cell === null;
            const hintPiece =
              state.phase === "move" &&
              Boolean(moving) &&
              relocating &&
              state.selectedFrom === null &&
              cell === moving;
            const hintDestination =
              state.phase === "move" &&
              Boolean(moving) &&
              relocating &&
              state.selectedFrom !== null &&
              cell === null;
            const hinted = hintPlacement || hintPiece || hintDestination;
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
                  "relative isolate grid size-full min-h-0 min-w-0 place-items-center overflow-hidden rounded-xl bg-secondary transition-[transform,background-color,box-shadow] duration-press ease-out active:scale-[0.97] disabled:pointer-events-none",
                  hinted && "morris-action-cell",
                  selected && "ring-4 ring-warning",
                  winning && "bg-warning-soft ring-4 ring-warning",
                )}
              >
                {cell && (
                  <Mark
                    key={cell}
                    side={cell}
                    className={cn(
                      "territory-count pointer-events-none absolute z-10 size-[58%]",
                      hintPiece && "morris-action-mark",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
        {state.phase === "ready" && (
          <p
            data-morris-ready-label
            className="pointer-events-none absolute inset-0 z-10 grid place-items-center text-[clamp(2.5rem,5cqw,4.5rem)] leading-none font-extrabold text-ink"
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
