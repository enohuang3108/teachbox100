"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Input } from "@/components/atoms/shadcn/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/shadcn/tabs";
import { QuestionPreview } from "@/components/organisms/QuestionPreview";
import { StepSetup, type SetupStep } from "@/components/organisms/StepSetup";
import { playableOf } from "@/lib/morris/game";
import { DEFAULT_NAMES, useMorrisStore } from "@/lib/morris/store";
import { DEFAULT_QUESTIONS } from "@/lib/questions/default-questions";
import {
  aiQuestionPrompt,
  buildTemplateBlob,
  parseQuestions,
  rowsFromFile,
} from "@/lib/questions/excel";
import {
  DIFFICULTIES,
  DIFFICULTY_CAP_LABEL,
  type Difficulty,
} from "@/lib/questions/types";
import { SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Download, Library, SlidersHorizontal, Upload } from "lucide-react";

const PRESS = "transition-transform duration-press ease-out active:scale-[0.97]";
const QUESTION_OPTIONS = { allowShort: false };
const MIN_QUESTIONS = 6;

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const {
    bank,
    useDefault,
    cap,
    names,
    setBank,
    setUseDefault,
    setCap,
    setName,
  } = useMorrisStore();
  const [errors, setErrors] = useState<string[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const active = useDefault ? DEFAULT_QUESTIONS : bank;
  const playable = playableOf(active, cap);

  async function readFile(file: File | undefined) {
    if (!file) return;
    setErrors([]);
    setSkipped(0);
    try {
      const result = parseQuestions(await rowsFromFile(file));
      if (!result.ok) {
        setErrors(result.errors.map((error) => `第 ${error.row} 列：${error.message}`));
        setBank([]);
        return;
      }
      const usable = result.questions.filter((question) => question.type !== "short");
      setSkipped(result.questions.length - usable.length);
      setBank(usable);
    } catch {
      setErrors(["檔案讀取失敗，請確認為 .xlsx 格式"]);
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(buildTemplateBlob(QUESTION_OPTIONS));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "圈叉搶答題庫範本.xlsx";
    anchor.click();
    URL.revokeObjectURL(url);
    navigator.clipboard
      .writeText(aiQuestionPrompt(QUESTION_OPTIONS))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  const blocker =
    playable.length < MIN_QUESTIONS
      ? useDefault
        ? `這個難度上限只有 ${playable.length} 題，至少要 ${MIN_QUESTIONS} 題`
        : bank.length === 0 && errors.length === 0
          ? ""
          : `篩選後只有 ${playable.length} 題，至少要 ${MIN_QUESTIONS} 題選擇或是非題`
      : !names[0].trim() || !names[1].trim()
        ? "兩隊都要有名字"
        : null;

  const steps: SetupStep[] = [
    {
      key: "bank",
      label: "題庫",
      icon: Library,
      summary: useDefault
        ? `內建題庫 ${playableOf(DEFAULT_QUESTIONS, cap).length} 題`
        : bank.length > 0
          ? `自訂 ${bank.length} 題`
          : "尚未匯入",
      done: playable.length >= MIN_QUESTIONS,
      content: (
        <section className="space-y-5">
          <header>
            <h3 className="text-h3 text-ink">要用哪份題庫？</h3>
            <DialogDescription className="mt-1">
              兩隊各自把整份題庫洗牌，當下看到的題目不會相同。只收選擇題與是非題，至少要六題。
            </DialogDescription>
          </header>
          <Tabs
            value={useDefault ? "default" : "custom"}
            onValueChange={(value) => setUseDefault(value === "default")}
            className="gap-4"
          >
            <TabsList aria-label="題庫來源">
              <TabsTrigger value="default" className="px-4">內建題庫</TabsTrigger>
              <TabsTrigger value="custom" className="px-4">自訂題庫</TabsTrigger>
            </TabsList>
            <TabsContent value="default">
              <QuestionPreview questions={playableOf(DEFAULT_QUESTIONS, "hard")} />
            </TabsContent>
            <TabsContent value="custom" className="space-y-3">
              <button
                type="button"
                aria-label={bank.length > 0 ? "換一份 Excel" : "匯入 Excel 題庫"}
                onClick={() => fileInput.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  readFile(event.dataTransfer.files[0]);
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-[background-color,border-color] duration-hover",
                  dragging ? "border-ink bg-secondary" : "border-border hover:bg-muted/60",
                )}
              >
                <Upload className="size-6 text-muted-foreground" aria-hidden />
                <span className="text-sm font-semibold text-ink">
                  {bank.length > 0 ? "換一份 Excel" : "把 .xlsx 拖進來，或點這裡選檔"}
                </span>
              </button>
              <input
                ref={fileInput}
                type="file"
                accept=".xlsx,.xls"
                className="sr-only"
                onChange={(event) => readFile(event.target.files?.[0])}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-caption text-muted-foreground">
                  下載範本會一併複製出題提示詞，貼給 AI 就能準備題庫。
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("rounded-full", PRESS)}
                  onClick={downloadTemplate}
                >
                  <Download className="size-4" aria-hidden />
                  <span className="grid">
                    <span className={cn("col-start-1 row-start-1", copied && "invisible")}>
                      下載題庫範本
                    </span>
                    <span className={cn("col-start-1 row-start-1", !copied && "invisible")}>
                      已複製提示詞
                    </span>
                  </span>
                </Button>
              </div>
              {skipped > 0 && (
                <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink">
                  已略過 {skipped} 題簡答題——這個單元需要能自動判對錯。
                </p>
              )}
              {errors.length > 0 && (
                <ul className="max-h-40 overflow-y-auto rounded-xl bg-danger-soft px-4 py-3 text-sm leading-[1.75] text-danger-ink">
                  {errors.map((error, index) => <li key={index}>{error}</li>)}
                </ul>
              )}
              {bank.length > 0 && <QuestionPreview questions={bank} />}
            </TabsContent>
          </Tabs>
        </section>
      ),
    },
    {
      key: "rules",
      label: "玩法",
      icon: SlidersHorizontal,
      summary: `${playable.length} 題・紅圈藍叉`,
      content: (
        <section className="space-y-6">
          <header>
            <h3 className="text-h3 text-ink">兩隊怎麼比？</h3>
            <DialogDescription className="mt-1">
              紅隊用圈、藍隊用叉。答對取得一個棋步；答錯看正解並等三秒。三枚棋連成橫、直或斜線就獲勝。
            </DialogDescription>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            {([0, 1] as const).map((index) => (
              <label key={index} className="space-y-1.5">
                <span className="text-sm font-semibold text-ink">
                  {index === 0 ? "紅色圈圈" : "藍色叉叉"}
                </span>
                <Input
                  value={names[index]}
                  maxLength={12}
                  onChange={(event) => setName(index, event.target.value)}
                  placeholder={DEFAULT_NAMES[index]}
                />
              </label>
            ))}
          </div>

          <Field
            label="難度上限"
            value={cap}
            onChange={(value) => setCap(value as Difficulty)}
            options={DIFFICULTIES.map((difficulty) => ({
              value: difficulty,
              label: DIFFICULTY_CAP_LABEL[difficulty],
            }))}
          />
          <p className="text-caption text-muted-foreground">
            難度只決定哪些題目會出現；每題答對都只取得一個棋步。
          </p>
        </section>
      ),
    },
  ];

  return (
    <StepSetup
      title="圈叉搶答設定"
      steps={steps}
      blocker={blocker}
      startLabel="開始比賽"
      onStart={onStart}
      share={{
        unit: "quiz-morris",
        setup: { bank: useDefault ? null : bank, cap, names },
      }}
    />
  );
}

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="group" htmlFor={`${label}-${option.value}`}>
            <span
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-hover",
                SELECTED_OPTION,
              )}
            >
              <RadioGroupItem value={option.value} id={`${label}-${option.value}`} />
              <span className="text-sm font-medium">{option.label}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
