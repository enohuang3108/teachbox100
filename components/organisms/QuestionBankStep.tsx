"use client";

import { useState } from "react";
import { Download, Pencil, Plus, Upload } from "lucide-react";
import { Button } from "@/components/atoms/shadcn/button";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/shadcn/radio-group";
import { BankEditor } from "@/components/organisms/BankEditor";
import { AnswerLengthNotice, DIFFICULTY_DOT } from "@/components/organisms/QuestionPreview";
import { aiQuestionPrompt, buildTemplateBlob, parseQuestions, rowsFromFile } from "@/lib/questions/excel";
import { activeQuestions, findBank, useQuestionLibrary, type BankDraft } from "@/lib/questions/library";
import { DIFFICULTIES, DIFFICULTY_LABEL, difficultyOf, type Question } from "@/lib/questions/types";
import { SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const PRESS = "transition-transform duration-press ease-out active:scale-[0.97]";

/** 在瀏覽器出題時先放範本的兩題，老師看得出格式再改 */
const templateQuestions = (): Question[] => [
  { id: crypto.randomUUID(), type: "choice", text: "台灣最高的山是？", options: ["玉山", "雪山", "合歡山", "阿里山"], answer: "玉山", difficulty: "easy" },
  { id: crypto.randomUUID(), type: "boolean", text: "台北是台灣的首都", answer: "是", difficulty: "normal" },
];

const updated = (ms: number) =>
  new Date(ms).toLocaleString("zh-TW", { dateStyle: "short", timeStyle: "short" });

/**
 * 出題遊戲共用的「題庫」步驟：內建題庫在最上面，下面是存在這個瀏覽器、各遊戲共用的題庫。
 * 清單單選、整個清單都能拖 Excel 進來、鉛筆開編輯器。遊戲只決定自己選哪份、能出哪些題。
 */
export function QuestionBankStep({
  builtIn,
  playable,
  bankId,
  onSelect,
  allowShort,
  templateName,
}: {
  builtIn: Question[];
  /** 這個遊戲出得了的題目；清單上的難度題數照這個算 */
  playable: (questions: Question[]) => Question[];
  bankId: string | null;
  onSelect: (id: string | null) => void;
  allowShort: boolean;
  /** 下載範本的檔名，例如「領地戰題庫範本.xlsx」 */
  templateName: string;
}) {
  const { banks, saveBank, removeBank } = useQuestionLibrary();
  const [errors, setErrors] = useState<string[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState<BankDraft | null>(null);
  const saved = findBank(banks, bankId);
  const active = saved ? activeQuestions(saved) : builtIn;

  async function readFile(file: File | undefined) {
    if (!file) return;
    setErrors([]);
    setSkipped(0);
    try {
      const result = parseQuestions(await rowsFromFile(file));
      if (!result.ok) {
        setErrors(result.errors.map((er) => `第 ${er.row} 列：${er.message}`));
        return;
      }
      // 題庫各遊戲共用，簡答題照存；這個遊戲出不了的講清楚，老師很可能直接拿大富翁的檔過來
      setSkipped(result.questions.length - playable(result.questions).length);
      // 檔名就是題庫名稱；同名再匯入一次是更新那份
      onSelect(saveBank({ title: file.name.replace(/\.xlsx?$/i, "") || "自訂題庫", questions: result.questions, off: [] }));
    } catch {
      setErrors(["檔案讀取失敗，請確認為 .xlsx 格式"]);
    }
  }

  function downloadTemplate() {
    const opts = { allowShort };
    const url = URL.createObjectURL(buildTemplateBlob(opts));
    const a = document.createElement("a");
    a.href = url;
    a.download = templateName;
    a.click();
    URL.revokeObjectURL(url);
    navigator.clipboard
      .writeText(aiQuestionPrompt(opts))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  const rows = [
    { id: "default", title: "內建題庫", questions: playable(builtIn), off: 0, time: "" },
    ...banks.map((b) => ({
      id: b.id,
      title: b.title,
      questions: playable(activeQuestions(b)),
      off: b.off.length,
      time: updated(b.updatedAt),
    })),
  ];

  return (
    <section className="space-y-5">
      <header>
        <h3 className="text-h3 text-ink">要用哪份題庫？</h3>
      </header>
      {/* 整個清單都收拖進來的 Excel */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          readFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "overflow-hidden rounded-2xl border transition-[background-color,border-color] duration-hover",
          dragging ? "border-ink bg-secondary ring-1 ring-ink" : "border-border",
        )}
      >
        <RadioGroup
          aria-label="題庫"
          value={saved ? saved.id : "default"}
          onValueChange={(v) => onSelect(v === "default" ? null : v)}
          className="gap-0"
        >
          {rows.map((b) => {
            const own = banks.find((x) => x.id === b.id);
            return (
              <div key={b.id} className="group flex items-center border-b border-border last:border-b-0">
                <label
                  htmlFor={`bank-${b.id}`}
                  className={cn(
                    "flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-hover",
                    SELECTED_OPTION,
                  )}
                >
                  <RadioGroupItem value={b.id} id={`bank-${b.id}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{b.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-caption text-muted-foreground">
                      {DIFFICULTIES.map((d) => (
                        <span key={d} className="flex items-center gap-1.5">
                          <span className={cn("size-2 rounded-full", DIFFICULTY_DOT[d])} aria-hidden />
                          {DIFFICULTY_LABEL[d]} {b.questions.filter((q) => difficultyOf(q) === d).length}
                        </span>
                      ))}
                      {b.off > 0 && <span>停用 {b.off}</span>}
                    </span>
                  </span>
                  {b.time && <span className="shrink-0 text-caption text-muted-foreground">{b.time}</span>}
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("mx-2 shrink-0 rounded-full text-muted-foreground", PRESS)}
                  aria-label={`編輯${b.title}`}
                  onClick={() =>
                    setEditing(
                      own
                        ? { id: own.id, title: own.title, questions: own.questions, off: own.off }
                        : { title: "內建題庫（我的版本）", questions: builtIn, off: [] },
                    )
                  }
                >
                  <Pencil className="size-4" aria-hidden />
                </Button>
              </div>
            );
          })}
        </RadioGroup>
        <label className="flex cursor-pointer items-center gap-3 border-t border-dashed border-border px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors duration-hover hover:bg-muted/60">
          <Upload className="size-4" aria-hidden />
          匯入 .xlsx（點這裡選檔，或拖進清單）
          <input
            type="file"
            accept=".xlsx,.xls"
            className="sr-only"
            onChange={(e) => {
              readFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption text-muted-foreground">
          沒有題庫？下載題庫範本會附一段提示詞，貼給 AI 就能出題；也可以直接在瀏覽器出題。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn("rounded-full", PRESS)}
            onClick={() => setEditing({ title: "", questions: templateQuestions(), off: [] })}
          >
            <Plus className="size-4" aria-hidden />
            在瀏覽器出題
          </Button>
          <Button variant="outline" size="sm" className={cn("rounded-full", PRESS)} onClick={downloadTemplate}>
            <Download className="size-4" aria-hidden />
            {/* 兩段文字疊在同一格，寬度固定取長的那段，換字不會把按鈕擠到下一行 */}
            <span className="grid">
              <span className={cn("col-start-1 row-start-1", copied && "invisible")}>下載題庫範本</span>
              <span className={cn("col-start-1 row-start-1", !copied && "invisible")}>已複製提示詞</span>
            </span>
          </Button>
        </div>
      </div>
      {skipped > 0 && (
        <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink">
          這個遊戲出不了其中 {skipped} 題（例如簡答題），會略過；題庫裡照樣保留，其他遊戲可以用。
        </p>
      )}
      {errors.length > 0 && (
        <ul className="max-h-40 overflow-y-auto rounded-xl bg-danger-soft px-4 py-3 text-sm leading-[1.75] text-danger-ink">
          {errors.map((er, i) => (
            <li key={i}>{er}</li>
          ))}
        </ul>
      )}
      <AnswerLengthNotice questions={playable(active)} />
      {editing && (
        <BankEditor
          initial={editing}
          allowShort={allowShort}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            onSelect(saveBank(draft));
            setEditing(null);
          }}
          onDelete={
            editing.id
              ? () => {
                  removeBank(editing.id!);
                  if (bankId === editing.id) onSelect(null);
                  setEditing(null);
                }
              : undefined
          }
        />
      )}
    </section>
  );
}
