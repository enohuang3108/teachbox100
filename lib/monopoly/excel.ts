import * as XLSX from "xlsx";
import type { Question, QuestionType } from "./types";

export interface RawRow {
  題型?: string;
  題目?: string;
  選項A?: string;
  選項B?: string;
  選項C?: string;
  選項D?: string;
  正確答案?: string;
  解析?: string;
}

export interface ParseError {
  row: number;
  message: string;
}
export type ParseResult =
  | { ok: true; questions: Question[] }
  | { ok: false; errors: ParseError[] };

const TYPE_MAP: Record<string, QuestionType> = {
  選擇: "choice",
  是非: "boolean",
  簡答: "short",
};

const LETTER_TO_INDEX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

function str(v: unknown): string {
  return (v ?? "").toString().trim();
}

export function parseQuestions(rows: RawRow[]): ParseResult {
  if (rows.length === 0) {
    return {
      ok: false,
      errors: [{ row: 1, message: "題庫不可為空，請至少提供一題" }],
    };
  }
  const errors: ParseError[] = [];
  const questions: Question[] = [];

  rows.forEach((raw, i) => {
    const rowNum = i + 2; // 表頭佔第 1 列
    const typeText = str(raw.題型);
    const text = str(raw.題目);
    const answerRaw = str(raw.正確答案);
    const explanation = str(raw.解析) || undefined;

    const type = TYPE_MAP[typeText];
    if (!type) {
      errors.push({
        row: rowNum,
        message: `題型「${typeText}」不合法，須為 選擇／是非／簡答`,
      });
      return;
    }
    if (!text) {
      errors.push({ row: rowNum, message: "題目不可為空" });
      return;
    }
    if (!answerRaw) {
      errors.push({ row: rowNum, message: "正確答案不可為空" });
      return;
    }

    if (type === "choice") {
      const options = [raw.選項A, raw.選項B, raw.選項C, raw.選項D]
        .map(str)
        .filter((o) => o !== "");
      if (options.length < 2) {
        errors.push({ row: rowNum, message: "選擇題至少需要兩個選項" });
        return;
      }
      let answer: string;
      const letterIdx = LETTER_TO_INDEX[answerRaw.toUpperCase()];
      if (letterIdx !== undefined) {
        if (letterIdx >= options.length) {
          errors.push({
            row: rowNum,
            message: `正確答案「${answerRaw}」對應的選項不存在`,
          });
          return;
        }
        answer = options[letterIdx];
      } else if (options.includes(answerRaw)) {
        answer = answerRaw;
      } else {
        errors.push({
          row: rowNum,
          message: `正確答案「${answerRaw}」不在選項中`,
        });
        return;
      }
      questions.push({ id: `q${i}`, type, text, options, answer, explanation });
      return;
    }

    if (type === "boolean") {
      const yes = ["是", "對", "true", "○"];
      const no = ["否", "錯", "false", "✗", "x", "X"];
      let answer: string;
      if (yes.includes(answerRaw)) answer = "是";
      else if (no.includes(answerRaw)) answer = "否";
      else {
        errors.push({
          row: rowNum,
          message: `是非題答案「${answerRaw}」須為 是／否`,
        });
        return;
      }
      questions.push({ id: `q${i}`, type, text, answer, explanation });
      return;
    }

    // short
    questions.push({ id: `q${i}`, type, text, answer: answerRaw, explanation });
  });

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, questions };
}

// === 瀏覽器端：檔案 → rows ===
export async function rowsFromFile(file: File): Promise<RawRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
}

// === 給 AI 產生題庫用的提示詞 ===
// 與上方欄位格式同一處維護，避免規格漂移。
export const AI_QUESTION_PROMPT = `你是一位出題助手。請依照以下規格，幫我產生一份可直接匯入的 Excel (.xlsx) 題庫檔案。

【欄位格式】第一列為下列標題，順序固定：
題型｜題目｜選項A｜選項B｜選項C｜選項D｜正確答案｜解析

【填寫規則】
1. 題型：限填「選擇」「是非」「簡答」其中之一。
2. 選擇題：選項A～D至少填兩個；正確答案填對應字母（A／B／C／D）或選項文字。
3. 是非題：選項欄位留空；正確答案填「是」或「否」。
4. 簡答題：選項欄位留空；正確答案直接填答案文字。
5. 解析：可留空，建議簡短說明。

【範例】
選擇｜台灣最高的山是？｜玉山｜雪山｜合歡山｜阿里山｜A｜玉山海拔3952公尺
是非｜台北是台灣的首都｜｜｜｜｜是｜
簡答｜台灣最長的河川是？｜｜｜｜｜濁水溪｜

【我的需求】
請依上述格式，產生〈在此補上：年級／科目／主題／題數，例如「國小三年級數學乘法，共20題，以選擇題為主」〉，最後輸出成可下載的 .xlsx 檔案。`;

// === 下載範本 ===
export function buildTemplateBlob(): Blob {
  const data = [
    {
      題型: "選擇",
      題目: "台灣最高的山是？",
      選項A: "玉山",
      選項B: "雪山",
      選項C: "合歡山",
      選項D: "阿里山",
      正確答案: "A",
      解析: "玉山海拔3952公尺",
    },
    {
      題型: "是非",
      題目: "台北是台灣的首都",
      選項A: "",
      選項B: "",
      選項C: "",
      選項D: "",
      正確答案: "是",
      解析: "",
    },
    {
      題型: "簡答",
      題目: "台灣最長的河川是？",
      選項A: "",
      選項B: "",
      選項C: "",
      選項D: "",
      正確答案: "濁水溪",
      解析: "",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(data, {
    header: [
      "題型",
      "題目",
      "選項A",
      "選項B",
      "選項C",
      "選項D",
      "正確答案",
      "解析",
    ],
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "題庫");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
