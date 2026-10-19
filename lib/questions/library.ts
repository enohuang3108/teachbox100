import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Question } from "./types";

/** 老師匯入、在瀏覽器出題或從分享連結收到的一份題庫；標題取自 Excel 檔名。各出題遊戲共用 */
export interface SavedBank {
  id: string;
  title: string;
  questions: Question[];
  /** 老師在編輯器取消勾選、這次不出的題目 id */
  off: string[];
  updatedAt: number;
}

export type BankDraft = Pick<SavedBank, "title" | "questions" | "off"> & { id?: string };

interface QuestionLibrary {
  banks: SavedBank[];
  /** 有 id 改那份；沒有 id 時同名題庫視為同一份，否則加到清單。存完排最上面，回傳 id 給單元選用 */
  saveBank: (draft: BankDraft) => string;
  removeBank: (id: string) => void;
}

export const useQuestionLibrary = create<QuestionLibrary>()(
  persist(
    (set, get) => ({
      banks: [],
      saveBank: ({ id, title, questions, off }) => {
        const same = id ?? get().banks.find((b) => b.title === title)?.id;
        const saved = { id: same ?? crypto.randomUUID(), title, questions, off, updatedAt: Date.now() };
        set({ banks: [saved, ...get().banks.filter((b) => b.id !== saved.id)] });
        return saved.id;
      },
      removeBank: (id) => set({ banks: get().banks.filter((b) => b.id !== id) }),
    }),
    { name: "question-banks" },
  ),
);

/** 勾選要出的題目 */
export const activeQuestions = (bank: Pick<SavedBank, "questions" | "off">) =>
  bank.questions.filter((q) => !bank.off.includes(q.id));

/** 單元選用的題庫；被刪掉或不存在就回到內建 */
export const findBank = (banks: SavedBank[], id: string | null) =>
  banks.find((b) => b.id === id) ?? null;

export const useSelectedBank = (id: string | null) =>
  useQuestionLibrary((s) => findBank(s.banks, id));

/**
 * 舊版各單元只存一份自訂題庫：搬進共用清單，回傳 id 讓單元繼續選它。
 * 單元 store 的 migrate 呼叫；共用清單先 import 先 hydrate，這裡寫進去不會被蓋掉。
 */
export function adoptLegacyBank(id: string, title: string, questions: Question[] | undefined) {
  if (!questions?.length) return null;
  const { banks } = useQuestionLibrary.getState();
  if (!banks.some((b) => b.id === id)) {
    useQuestionLibrary.setState({
      banks: [...banks, { id, title, questions, off: [], updatedAt: Date.now() }],
    });
  }
  return id;
}

// 分享連結解碼時題目 id 會重編，比內容不比 id
const content = (questions: Question[]) => JSON.stringify(questions.map((q) => ({ ...q, id: "" })));
const sameQuestions = (a: Question[], b: Question[]) => content(a) === content(b);

/**
 * 分享連結帶來的題庫存進清單並回傳 id 讓單元選它；連結用內建題庫時回 null。
 * 不用 saveBank 的同名覆蓋：老師自己的同名題庫不能被別人的連結蓋掉，撞名就另存「名稱（分享）」；
 * 同一份題目已經在清單裡（同一條連結再開）就選回那份，不再多存。
 */
export function receiveSharedBank(bank: Question[] | null, title?: string) {
  if (!bank) return null;
  const { banks, saveBank } = useQuestionLibrary.getState();
  const known = banks.find((b) => sameQuestions(b.questions, bank));
  if (known) return known.id;
  const base = title || "分享的題庫";
  const taken = new Set(banks.map((b) => b.title));
  let name = base;
  for (let n = 1; taken.has(name); n++) name = `${base}（分享${n === 1 ? "" : ` ${n}`}）`;
  return saveBank({ title: name, questions: bank, off: [] });
}
