import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultRng } from "./rng";
import {
  answerCardQuiz,
  answerPassStart,
  answerQuestion,
  checkEnd,
  confirmPurchase,
  drawAndApplyCard,
  resolveCardDice,
  rollCardDice,
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
  /** 傳 questions 就用那份開局（預設題庫），不覆蓋老師匯入的 draftQuestions */
  begin: (questions?: Question[]) => void;
  roll: () => void;
  answer: (correct: boolean) => void;
  answerPassStart: (correct: boolean) => void;
  confirm: (accept: boolean) => void;
  resolveCard: () => void;
  rollCardDice: () => void;
  resolveCardDice: () => void;
  answerCardQuiz: (correct: boolean) => void;
  endIfTimeUp: () => void;
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

      begin: (questions) => {
        const { draftSettings, draftPlayers } = get();
        const draftQuestions = questions ?? get().draftQuestions;
        if (draftQuestions.length === 0 || draftPlayers.length < 2) return;
        const settings = draftSettings;
        set({
          game: startGame(settings, draftQuestions, draftPlayers, now()),
        });
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
      answerPassStart: (correct) => {
        const g = get().game;
        if (!g) return;
        set({ game: answerPassStart(g, correct, defaultRng, now()) });
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
      rollCardDice: () => {
        const g = get().game;
        if (!g) return;
        set({ game: rollCardDice(g, defaultRng) });
      },
      resolveCardDice: () => {
        const g = get().game;
        if (!g) return;
        set({ game: resolveCardDice(g, defaultRng, now()) });
      },
      answerCardQuiz: (correct) => {
        const g = get().game;
        if (!g) return;
        set({ game: answerCardQuiz(g, correct, now()) });
      },
      // 時間到結束條件：由右上角倒數計時器歸零時呼叫，主動把遊戲收尾。
      // （平時結束判定只在擲骰／回合結束觸發，沒人操作時不會自動結束）
      endIfTimeUp: () => {
        const g = get().game;
        if (!g || g.phase !== "playing") return;
        if (g.settings.endCondition.type !== "time") return;
        const next = checkEnd(g, now());
        if (next.phase === "gameover") set({ game: next });
      },
      reset: () => set({ game: null }),
    }),
    {
      name: "monopoly-game",
      // v1：起始金額開放老師設定。v0 時它不能改、畫面一律當 8000，
      // 但 persist 裡可能還留著更早的預設 15000，升級時統一換成 8000
      version: 1,
      migrate: (persisted, version) => {
        const s = persisted as { draftSettings?: GameSettings };
        if (version < 1 && s.draftSettings) {
          s.draftSettings = { ...s.draftSettings, startingMoney: 8000 };
        }
        return s as never;
      },
    },
  ),
);
