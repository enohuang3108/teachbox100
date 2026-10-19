import type { Difficulty, Question } from "./types";

/** 編輯器裡的一列。選擇題固定四格選項，answer 存正確選項的位置，改選項文字不會讓答案失效；簡答題 answer 是答案文字 */
export interface DraftRow {
  id: string;
  on: boolean;
  type: Question["type"];
  text: string;
  options: string[];
  answer: string;
  difficulty: Difficulty;
  explanation?: string;
}

export function toRows(questions: Question[], off: string[]): DraftRow[] {
  return questions.map((q) => {
    const options = q.type === "choice" ? [...(q.options ?? []), "", "", "", ""].slice(0, 4) : ["", "", "", ""];
    return {
      id: q.id,
      on: !off.includes(q.id),
      type: q.type,
      text: q.text,
      options,
      answer: q.type === "choice" ? String(Math.max(0, options.indexOf(q.answer))) : q.answer,
      difficulty: q.difficulty ?? "normal",
      explanation: q.explanation,
    };
  });
}

export function blankRow(): DraftRow {
  return { id: crypto.randomUUID(), on: true, type: "choice", text: "", options: ["", "", "", ""], answer: "0", difficulty: "normal" };
}

/** 每一列的錯誤（沒錯是 null），錯誤要指到那一題 */
export function rowErrors(rows: DraftRow[]): (string | null)[] {
  return rows.map((r) => {
    if (!r.text.trim()) return "題目還沒填";
    if (r.type === "boolean") return r.answer === "是" || r.answer === "否" ? null : "請選是或否";
    if (r.type === "short") return r.answer.trim() ? null : "答案還沒填";
    if (r.options.filter((o) => o.trim()).length < 2) return "選擇題至少要兩個選項";
    if (!r.options[Number(r.answer)]?.trim()) return "正確答案的選項是空的";
    return null;
  });
}

export function toBank(rows: DraftRow[]): { questions: Question[]; off: string[] } {
  return {
    questions: rows.map((r) => ({
      id: r.id,
      type: r.type,
      text: r.text.trim(),
      ...(r.type === "choice" ? { options: r.options.map((o) => o.trim()).filter(Boolean) } : {}),
      answer: r.type === "choice" ? r.options[Number(r.answer)].trim() : r.answer.trim(),
      difficulty: r.difficulty,
      ...(r.explanation ? { explanation: r.explanation } : {}),
    })),
    off: rows.filter((r) => !r.on).map((r) => r.id),
  };
}
