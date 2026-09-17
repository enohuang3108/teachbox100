"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import {
  makeNextQuestion,
  verdict,
  type Question,
} from "@/lib/math/multiplication";
import { useCallback, useEffect, useRef, useState } from "react";

const NEXT_DELAY = 620;

export function Quiz({
  tables,
  count,
  soundOn,
  onQuit,
}: {
  tables: number[];
  count: number;
  soundOn: boolean;
  onQuit: () => void;
}) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<
    { a: number; b: number; picked: number; answer: number }[]
  >([]);
  const timeout = useRef(0);
  const { playCorrectSound, playWrongSound } = useSound();

  const nextQuestion = useCallback(() => {
    setQuestion((prev) => makeNextQuestion(tables, prev));
    setPicked(null);
  }, [tables]);

  // 第一題在 client 才抽，SSR 與 hydration 兩邊的亂數才不會對不起來
  useEffect(() => {
    nextQuestion();
    return () => window.clearTimeout(timeout.current);
  }, [nextQuestion]);

  const answer = (value: number) => {
    if (picked !== null || !question) return;
    setPicked(value);

    const right = value === question.answer;
    if (soundOn) (right ? playCorrectSound : playWrongSound)();
    if (right) setCorrect((c) => c + 1);
    setHistory((h) => [
      ...h,
      { a: question.a, b: question.b, picked: value, answer: question.answer },
    ]);

    // 答對就自己跳下一題；答錯多留一會兒，讓孩子看清楚正確答案在哪
    timeout.current = window.setTimeout(
      () => {
        const done = index + 1 >= count;
        setIndex((i) => i + 1);
        if (done) {
          setFinished(true);
          if (right && correct + 1 === count) realisticEffect();
        } else {
          nextQuestion();
        }
      },
      right ? NEXT_DELAY : NEXT_DELAY * 2,
    );
  };

  const log = (
    <aside
      aria-label="作答紀錄"
      className="fixed top-20 left-4 z-(--z-sticky) w-64 rounded-3xl bg-card/90 px-5 pt-5 pb-4 shadow-sm backdrop-blur-[2px] [#game-stage:fullscreen_&]:top-4"
    >
      <h2 className="font-display text-2xl font-extrabold text-ink">
        作答紀錄
      </h2>
      <p className="mt-0.5 text-caption text-ink-soft tabular-nums">
        第 {Math.min(index + 1, count)} / {count} 題・答對 {correct}
      </p>
      {history.length === 0 ? (
        <p className="mt-3 text-caption text-ink-soft">答完的題目會列在這裡。</p>
      ) : (
        <ol className="mt-2 max-h-[40svh] divide-y divide-border overflow-y-auto">
          {history.map((h, i) => {
            const right = h.picked === h.answer;
            return (
              <li
                key={i}
                className="flex items-center justify-between gap-3 py-3 text-sm tabular-nums"
              >
                <span className="font-bold text-ink">
                  {h.a} × {h.b} = {h.answer}
                </span>
                <span
                  className={`shrink-0 font-bold ${right ? "text-brand-green" : "text-brand-red"}`}
                >
                  {right ? "答對" : `答錯（選 ${h.picked}）`}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );

  if (finished) {
    return (
      <>
      {log}
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-muted-foreground text-lg">答對了</p>
        <p className="font-display text-ink text-6xl font-black tabular-nums">
          {correct} / {count}
        </p>
        <p className="text-ink-soft text-lg">{verdict(correct, count)}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onQuit}>
            改設定
          </Button>
          <Button
            onClick={() => {
              setCorrect(0);
              setHistory([]);
              setIndex(0);
              setFinished(false);
              nextQuestion();
            }}
          >
            再練一輪
          </Button>
        </div>
      </div>
      </>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col items-center">
      {log}

      {/* key 換掉整塊，換題的淡入才會重播 */}
      <div
        key={`${question.a}-${question.b}-${index}`}
        className="quiz-enter flex w-full flex-col items-center gap-14 sm:gap-20"
      >
        <p className="font-display text-ink text-[clamp(4rem,18vw,8rem)] leading-none font-black tabular-nums">
          {question.a} × {question.b} = ?
        </p>

        <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:max-w-2xl sm:gap-4">
          {question.options.map((option) => {
            const isAnswer = option === question.answer;
            const chosen = picked === option;
            const revealed = picked !== null;
            return (
              <button
                key={option}
                type="button"
                disabled={revealed}
                onClick={() => answer(option)}
                className={`font-display rounded-2xl border-2 py-6 text-4xl sm:py-10 sm:text-6xl font-black tabular-nums transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] disabled:active:scale-100 ${
                  chosen && !isAnswer ? "quiz-shake" : ""
                } ${
                  revealed && isAnswer
                    ? "border-brand-green bg-brand-green text-paper"
                    : chosen
                      ? "border-brand-red bg-brand-red text-paper"
                      : "border-ink/10 bg-paper-warm text-ink hover:border-ink/25"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
