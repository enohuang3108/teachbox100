// 題庫的共通型別。**全站共通格式**，各單元都吃這一份（ADR-0001）。
// 單元可以只支援其中一部分題型（領地戰不收 short），但欄位定義只有這裡一份。
export type QuestionType = "choice" | "boolean" | "short";

// 難度：Excel 未填或舊題庫視為「普通」
export type Difficulty = "easy" | "normal" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "簡單",
  normal: "普通",
  hard: "困難",
};

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  answer: string; // choice: 選項文字; boolean: "是"/"否"; short: 參考答案
  explanation?: string;
  difficulty?: Difficulty; // 未填 = normal
}

export function difficultyOf(q: Question): Difficulty {
  return q.difficulty ?? "normal";
}

// 差異化教學給學生的是「上限」：設普通的學生抽簡單與普通，設困難的三級都抽
export const DIFFICULTY_CAP_LABEL: Record<Difficulty, string> = {
  easy: "簡單",
  normal: "普通以下",
  hard: "困難以下",
};

export function withinCap(q: Question, cap: Difficulty): boolean {
  return DIFFICULTIES.indexOf(difficultyOf(q)) <= DIFFICULTIES.indexOf(cap);
}

