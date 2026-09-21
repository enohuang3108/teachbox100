"use client";

import { useState } from "react";
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
import { cellCount, gridFor, playableOf } from "@/lib/territory/rules";
import { DEFAULT_NAMES, useTerritoryStore } from "@/lib/territory/store";
import { SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Download, Library, SlidersHorizontal, Upload } from "lucide-react";

const PRESS =
  "transition-transform duration-press ease-out active:scale-[0.97]";

/** 這個單元的題庫只收選擇與是非，範本與提示詞都不請 AI 出簡答 */
const OPTS = { allowShort: false };

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
  } = useTerritoryStore();
  const [errors, setErrors] = useState<string[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const active = useDefault ? DEFAULT_QUESTIONS : bank;
  // 只有能自動判對錯的題目才進得了這個單元，難度上限也在這裡先套用
  const playable = playableOf(active, cap);
  // 跟開局用同一個螢幕比例算，這裡寫的就是全螢幕時會看到的棋盤
  const grid = gridFor(
    cellCount(playable.length),
    window.screen.width / window.screen.height,
  );

  async function readFile(file: File | undefined) {
    if (!file) return;
    setErrors([]);
    setSkipped(0);
    try {
      const result = parseQuestions(await rowsFromFile(file));
      if (!result.ok) {
        setErrors(result.errors.map((er) => `第 ${er.row} 列：${er.message}`));
        setBank([]);
        return;
      }
      // 簡答題不退件，略過並講清楚 —— 老師很可能直接拿大富翁的題庫檔過來
      const usable = result.questions.filter((q) => q.type !== "short");
      setSkipped(result.questions.length - usable.length);
      setBank(usable);
    } catch {
      setErrors(["檔案讀取失敗，請確認為 .xlsx 格式"]);
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(buildTemplateBlob(OPTS));
    const a = document.createElement("a");
    a.href = url;
    a.download = "領地戰題庫範本.xlsx";
    a.click();
    URL.revokeObjectURL(url);
    navigator.clipboard
      .writeText(aiQuestionPrompt(OPTS))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  const blocker =
    playable.length === 0
      ? useDefault
        ? "這個難度上限抽不到題目，放寬一點"
        : bank.length === 0 && errors.length === 0
          ? "" // 還沒選檔：擋住開始，但不亮紅字
          : "題庫裡沒有可用的題目（只收選擇題與是非題）"
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
      done: playable.length > 0,
      content: (
        <section className="space-y-5">
          <header>
            <h3 className="text-h3 text-ink">要用哪份題庫？</h3>
            <DialogDescription className="mt-1">
              搶答要當場判對錯，所以只收選擇題與是非題。Excel
              欄位跟大富翁那份一樣，兩邊的檔可以互相拿來用。題目越多，棋盤越大。
            </DialogDescription>
          </header>
          <Tabs
            value={useDefault ? "default" : "custom"}
            onValueChange={(v) => setUseDefault(v === "default")}
            className="gap-4"
          >
            <TabsList aria-label="題庫來源">
              <TabsTrigger value="default" className="px-4">
                內建題庫
              </TabsTrigger>
              <TabsTrigger value="custom" className="px-4">
                自訂題庫
              </TabsTrigger>
            </TabsList>
            <TabsContent value="default">
              <QuestionPreview
                questions={playableOf(DEFAULT_QUESTIONS, "hard")}
              />
            </TabsContent>
            <TabsContent value="custom" className="space-y-3">
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  readFile(e.dataTransfer.files[0]);
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-[background-color,border-color] duration-hover",
                  dragging
                    ? "border-ink bg-secondary"
                    : "border-border hover:bg-muted/60",
                )}
              >
                <Upload className="size-6 text-muted-foreground" aria-hidden />
                <span className="text-sm font-semibold text-ink">
                  {bank.length > 0
                    ? "換一份 Excel"
                    : "把 .xlsx 拖進來，或點這裡選檔"}
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="sr-only"
                  onChange={(e) => readFile(e.target.files?.[0])}
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-caption text-muted-foreground">
                  沒有題庫？下載題庫範本會附一段提示詞，貼給 AI 就能出題。
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("rounded-full", PRESS)}
                  onClick={downloadTemplate}
                >
                  <Download className="size-4" aria-hidden />
                  {/* 兩段文字疊在同一格，寬度固定取長的那段，換字不會把按鈕擠到下一行 */}
                  <span className="grid">
                    <span
                      className={cn(
                        "col-start-1 row-start-1",
                        copied && "invisible",
                      )}
                    >
                      下載題庫範本
                    </span>
                    <span
                      className={cn(
                        "col-start-1 row-start-1",
                        !copied && "invisible",
                      )}
                    >
                      已複製提示詞
                    </span>
                  </span>
                </Button>
              </div>
              {skipped > 0 && (
                <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink">
                  已略過 {skipped} 題簡答題 —— 搶答需要能自動判對錯的題型。
                </p>
              )}
              {errors.length > 0 && (
                <ul className="max-h-40 overflow-y-auto rounded-xl bg-danger-soft px-4 py-3 text-sm leading-[1.75] text-danger-ink">
                  {errors.map((er, i) => (
                    <li key={i}>{er}</li>
                  ))}
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
      summary: `${playable.length} 題・棋盤 ${grid.cols}×${grid.rows}`,
      content: (
        <section className="space-y-6">
          <header>
            <h3 className="text-h3 text-ink">兩隊怎麼比？</h3>
            <DialogDescription className="mt-1">
              答對讓自己的顏色暈開，簡單 1 格、普通 2 格、困難 3
              格；答錯讓對方暈開 1
              格，而且這題不能再按。中立格占完就開始互吃，吃光對方的一隊贏。
            </DialogDescription>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            {([0, 1] as const).map((i) => (
              <label key={i} className="space-y-1.5">
                <span className="text-sm font-semibold text-ink">
                  {i === 0 ? "左邊那隊" : "右邊那隊"}
                </span>
                <Input
                  value={names[i]}
                  maxLength={12}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder={DEFAULT_NAMES[i]}
                />
              </label>
            ))}
          </div>

          <Field
            label="難度上限"
            hint=""
            value={cap}
            onChange={(v) => setCap(v as Difficulty)}
            options={DIFFICULTIES.map((d) => ({
              value: d,
              label: DIFFICULTY_CAP_LABEL[d],
            }))}
          />
        </section>
      ),
    },
  ];

  return (
    <StepSetup
      title="領地戰設定"
      steps={steps}
      blocker={blocker}
      startLabel="開始比賽"
      onStart={onStart}
      share={{
        unit: "quiz-territory",
        setup: {
          bank: useDefault ? null : bank,
          cap,
          names,
        },
      }}
    />
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-ink">
        {label}
        <span className="ml-2 text-caption font-normal text-muted-foreground">
          {hint}
        </span>
      </p>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-wrap gap-2"
      >
        {options.map((o) => (
          <label
            key={o.value}
            className="group"
            htmlFor={`${label}-${o.value}`}
          >
            <span
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-hover",
                SELECTED_OPTION,
              )}
            >
              <RadioGroupItem value={o.value} id={`${label}-${o.value}`} />
              <span className="text-sm font-medium">{o.label}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
