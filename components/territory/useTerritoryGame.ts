"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultRng } from "@/lib/monopoly/rng";
import type { Difficulty, Question } from "@/lib/questions/types";
import {
  cellCount,
  drawQuestions,
  gridFor,
  leaderOf,
  newBoard,
  resolveAnswer,
  spread,
  winnerOf,
  type Board,
  type Side,
} from "@/lib/territory/rules";

/** 結算後停留多久再出下一題。答錯留久一點，好讓兩隊看清楚正解 */
const PAUSE_CORRECT = 1400;
const PAUSE_WRONG = 2200;
/** 每題出現前的倒數，從幾開始、一拍多久 */
const COUNTDOWN_FROM = 3;
const COUNTDOWN_BEAT = 1000;
const NOT_READY: Record<Side, boolean> = { left: false, right: false };

export interface Flash {
  side: Side;
  correct: boolean;
  /** 按下去的那個選項；答對時要在鈕上標出來 */
  choice: string;
  /** 這題結束時才給的正解；對方還能接手時是 null —— 先講出來對方就白撿 */
  answer: string | null;
}

export interface TerritoryGame {
  board: Board;
  /** 棋盤的寬高比，開局時取螢幕比例，全螢幕剛好鋪滿 */
  aspect: number;
  /** 最近一次暈開依序變色的格子，畫面拿來排先後 */
  changed: number[];
  question: Question | null;
  /** 出題前的倒數 3、2、1；null 代表題目已經出來，或兩隊還沒都準備好 */
  countdown: number | null;
  /** 開局前兩隊各按一次「準備好了」，都按了才開始倒數 */
  ready: Record<Side, boolean>;
  markReady: (side: Side) => void;
  /** 這題已經答錯出局的那一隊 */
  lockedOut: Side | null;
  flash: Flash | null;
  /** 結算停留中，按鈕先鎖住 */
  settling: boolean;
  winner: Side | null;
  over: boolean;
  asked: number;
  total: number;
  answer: (side: Side, choice: string) => void;
  restart: () => void;
}

const screenAspect = () =>
  typeof window === "undefined" ? 16 / 9 : window.screen.width / window.screen.height;

export function useTerritoryGame(
  bank: Question[],
  cap: Difficulty,
  onResult?: (correct: boolean) => void,
): TerritoryGame {
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);
  const [board, setBoard] = useState<Board>(() => newBoard(3, 3));
  const [changed, setChanged] = useState<number[]>([]);
  const [lockedOut, setLockedOut] = useState<Side | null>(null);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [settling, setSettling] = useState(false);
  const [over, setOver] = useState(false);
  const [winner, setWinner] = useState<Side | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [ready, setReady] = useState<Record<Side, boolean>>(NOT_READY);
  const timer = useRef<number | null>(null);

  const restart = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    const q = drawQuestions(bank, cap, defaultRng);
    // 棋盤比例開局就定下來，中途切全螢幕只縮放、不重排，局面才不會亂
    const a = screenAspect();
    const { cols, rows } = gridFor(cellCount(q.length), a);
    setQueue(q);
    setIndex(0);
    // 新的一局先等兩隊都按「準備好了」，倒數由 markReady 啟動
    setCountdown(null);
    setReady(NOT_READY);
    setAspect(a);
    setBoard(newBoard(cols, rows));
    setChanged([]);
    setLockedOut(null);
    setFlash(null);
    setSettling(false);
    setOver(false);
    setWinner(null);
  }, [bank, cap]);

  useEffect(restart, [restart]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  // 倒數：每拍減一，數完才把題目與答案鈕放出來
  useEffect(() => {
    if (over || countdown === null) return;
    const id = window.setTimeout(
      () => setCountdown((c) => (c !== null && c > 1 ? c - 1 : null)),
      COUNTDOWN_BEAT,
    );
    return () => window.clearTimeout(id);
  }, [countdown, over]);

  const started = ready.left && ready.right;

  const markReady = useCallback((side: Side) => {
    setReady((r) => {
      if (r[side]) return r;
      const next = { ...r, [side]: true };
      if (next.left && next.right) setCountdown(COUNTDOWN_FROM);
      return next;
    });
  }, []);

  // 準備與倒數中都不給題目，兩隊同時看到、同時開搶
  const question =
    over || !started || countdown !== null ? null : (queue[index] ?? null);

  // 題目出完就用格數收尾
  useEffect(() => {
    if (!over && queue.length > 0 && index >= queue.length && !settling) {
      setOver(true);
      setWinner(leaderOf(board));
    }
  }, [index, queue.length, over, settling, board]);

  const nextRound = useCallback(() => {
    setFlash(null);
    setSettling(false);
    setLockedOut(null);
    setIndex((i) => i + 1);
    setCountdown(COUNTDOWN_FROM);
  }, []);

  const answer = useCallback(
    (side: Side, choice: string) => {
      if (!question || settling || over || lockedOut === side) return;
      const r = resolveAnswer(question, side, choice, lockedOut);
      const next = spread(board, r.side, r.cells);

      setBoard(next.board);
      setChanged(next.changed);
      setLockedOut(r.lockedOut);
      setFlash({
        side,
        correct: r.correct,
        choice,
        answer: r.roundOver ? question.answer : null,
      });
      onResult?.(r.correct);

      const won = winnerOf(next.board);
      if (won) {
        setSettling(true);
        timer.current = window.setTimeout(() => {
          setOver(true);
          setWinner(won);
          setSettling(false);
        }, PAUSE_CORRECT);
        return;
      }

      if (r.roundOver) {
        setSettling(true);
        timer.current = window.setTimeout(
          nextRound,
          r.correct ? PAUSE_CORRECT : PAUSE_WRONG,
        );
      }
      // 對方接手同一題：棋盤已經動了，但題目還在
    },
    [question, settling, over, lockedOut, board, onResult, nextRound],
  );

  return useMemo(
    () => ({
      board,
      aspect,
      changed,
      question,
      // 最後一題結算完、還沒宣布結束的那一拍，不要冒出一個「3」
      countdown: index < queue.length ? countdown : null,
      ready,
      markReady,
      lockedOut,
      flash,
      settling,
      winner,
      over,
      asked: Math.min(index + (over ? 0 : 1), queue.length),
      total: queue.length,
      answer,
      restart,
    }),
    [
      board,
      aspect,
      changed,
      question,
      countdown,
      ready,
      markReady,
      lockedOut,
      flash,
      settling,
      winner,
      over,
      index,
      queue.length,
      answer,
      restart,
    ],
  );
}
