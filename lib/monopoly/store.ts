import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultRng } from "./rng";
import {
  answerQuestion,
  confirmPurchase,
  drawAndApplyCard,
  startGame,
  takeTurn,
} from "./rules";
import {
  DEFAULT_SETTINGS,
  type GameSettings,
  type GameState,
  type PlayerInput,
  type Question,
} from "./types";

interface MonopolyStore {
  game: GameState | null;
  draftSettings: GameSettings;
  draftQuestions: Question[];
  draftPlayers: PlayerInput[];
  importQuestions: (questions: Question[]) => void;
  updateSettings: (patch: Partial<GameSettings>) => void;
  setPlayers: (players: PlayerInput[]) => void;
  begin: () => void;
  roll: () => void;
  answer: (correct: boolean) => void;
  confirm: (accept: boolean) => void;
  resolveCard: () => void;
  reset: () => void;
}

const now = () => Date.now();

export const useMonopolyStore = create<MonopolyStore>()(
  persist(
    (set, get) => ({
      game: null,
      draftSettings: DEFAULT_SETTINGS,
      draftQuestions: [],
      draftPlayers: [],

      importQuestions: (questions) => set({ draftQuestions: questions }),
      updateSettings: (patch) =>
        set((s) => ({ draftSettings: { ...s.draftSettings, ...patch } })),
      setPlayers: (players) => set({ draftPlayers: players }),

      begin: () => {
        const { draftSettings, draftQuestions, draftPlayers } = get();
        if (draftQuestions.length === 0 || draftPlayers.length < 2) return;
        set({ game: startGame(draftSettings, draftQuestions, draftPlayers, now()) });
      },

      roll: () => {
        const g = get().game;
        if (!g || g.phase !== "playing" || g.pendingAction) return;
        set({ game: takeTurn(g, defaultRng, now()) });
      },
      answer: (correct) => {
        const g = get().game;
        if (!g) return;
        set({ game: answerQuestion(g, correct, now()) });
      },
      confirm: (accept) => {
        const g = get().game;
        if (!g) return;
        set({ game: confirmPurchase(g, accept, now()) });
      },
      resolveCard: () => {
        const g = get().game;
        if (!g) return;
        set({ game: drawAndApplyCard(g, defaultRng, now()) });
      },
      reset: () => set({ game: null }),
    }),
    { name: "monopoly-game" },
  ),
);
