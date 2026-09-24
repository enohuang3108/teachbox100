"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
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
import { playableQuestions } from "@/lib/morse/game";
import { MORSE_QUESTIONS } from "@/lib/morse/questions";
import { useMorseStore } from "@/lib/morse/store";
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
import { playableOf } from "@/lib/territory/rules";
import { SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Download, Gauge, Library, Upload } from "lucide-react";

const PRESS =
  "transition-transform duration-press ease-out active:scale-[0.97]";

/** 要當場判對錯，範本與提示詞都不請 AI 出簡答 */
const OPTS = { allowShort: false };

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { bank, useDefault, cap, setBank, setUseDefault, setCap } =
    useMorseStore();
  const [errors, setErrors] = useState<string[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const playable = playableOf(useDefault ? MORSE_QUESTIONS : bank, cap);

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
      const usable = playableQuestions(result.questions);
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
    a.download = "終極密碼題庫範本.xlsx";
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
    playable.length > 0
      ? null
      : useDefault
        ? "這個難度上限抽不到題目，放寬一點"
        : bank.length === 0 && errors.length === 0
          ? "" // 還沒選檔：擋住開始，但不亮紅字
          : "題庫裡沒有可用的題目（只收選擇題與是非題）";

  const steps: SetupStep[] = [
    {
      key: "bank",
      label: "題庫",
      icon: Library,
      summary: useDefault
        ? `內建題庫 ${MORSE_QUESTIONS.length} 題`
        : bank.length > 0
          ? `自訂 ${bank.length} 題`
          : "尚未匯入",
      done: playable.length > 0,
      content: (
        <section className="space-y-5">
          <header>
            <h3 className="text-h3 text-ink">要用哪份題庫？</h3>
            <DialogDescription className="mt-1">
              答對題目才能猜密碼，所以只收選擇題與是非題。Excel
              欄位跟大富翁、領地戰一樣，檔案可以互相拿來用。
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
              <QuestionPreview questions={MORSE_QUESTIONS} />
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
                  已略過 {skipped} 題簡答題 —— 這裡需要能自動判對錯的題型。
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
      key: "cap",
      label: "難度",
      icon: Gauge,
      summary: `${DIFFICULTY_CAP_LABEL[cap]}・${playable.length} 題`,
      content: (
        <section className="space-y-5">
          <header>
            <h3 className="text-h3 text-ink">題目要多難？</h3>
            <DialogDescription className="mt-1">
              只從這個難度以下的題目抽。全班看同一題，挑大多數人答得出來的就好。
            </DialogDescription>
          </header>
          <RadioGroup
            value={cap}
            onValueChange={(v) => setCap(v as Difficulty)}
            className="flex flex-wrap gap-2"
          >
            {DIFFICULTIES.map((d) => (
              <label key={d} className="group" htmlFor={`morse-cap-${d}`}>
                <span
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-hover",
                    SELECTED_OPTION,
                  )}
                >
                  <RadioGroupItem value={d} id={`morse-cap-${d}`} />
                  <span className="text-sm font-medium">
                    {DIFFICULTY_CAP_LABEL[d]}
                  </span>
                </span>
              </label>
            ))}
          </RadioGroup>
        </section>
      ),
    },
  ];

  return (
    <StepSetup
      title="終極密碼設定"
      steps={steps}
      blocker={blocker}
      startLabel="開始遊戲"
      onStart={onStart}
      share={{
        unit: "morse",
        setup: { bank: useDefault ? null : bank, cap },
      }}
    />
  );
}
