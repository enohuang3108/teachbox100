"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  answerQuestion,
  chooseCell,
  createGame,
  endAsDraw,
  markReady,
  tickCooldown,
  tickCountdown,
  type GameState,
  type Side,
} from "@/lib/morris/game";
import { defaultRng } from "@/lib/monopoly/rng";
import type { Difficulty, Question } from "@/lib/questions/types";

export interface MorrisGame {
  state: GameState;
  markReady: (side: Side) => void;
  answer: (side: Side, choice: string) => void;
  chooseCell: (index: number) => void;
  endAsDraw: () => void;
  restart: () => void;
}

export function useMorrisGame(bank: Question[], cap: Difficulty): MorrisGame {
  const makeGame = useCallback(() => createGame(bank, cap, defaultRng), [bank, cap]);
  const [state, setState] = useState<GameState>(makeGame);

  const restart = useCallback(() => setState(makeGame()), [makeGame]);
  useEffect(restart, [restart]);

  useEffect(() => {
    if (state.phase !== "countdown") return;
    const timeout = window.setTimeout(() => setState(tickCountdown), 1000);
    return () => window.clearTimeout(timeout);
  }, [state.phase, state.countdown]);

  const redCooldown = state.lanes.red.cooldown;
  const blueCooldown = state.lanes.blue.cooldown;
  useEffect(() => {
    if (state.phase !== "quiz" || redCooldown <= 0) return;
    const timeout = window.setTimeout(
      () => setState((current) => tickCooldown(current, "red")),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [state.phase, redCooldown]);
  useEffect(() => {
    if (state.phase !== "quiz" || blueCooldown <= 0) return;
    const timeout = window.setTimeout(
      () => setState((current) => tickCooldown(current, "blue")),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [state.phase, blueCooldown]);

  return useMemo(
    () => ({
      state,
      markReady: (side: Side) => setState((current) => markReady(current, side)),
      answer: (side: Side, choice: string) =>
        setState((current) => answerQuestion(current, side, choice)),
      chooseCell: (index: number) => setState((current) => chooseCell(current, index)),
      endAsDraw: () => setState(endAsDraw),
      restart,
    }),
    [state, restart],
  );
}
