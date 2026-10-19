"use client";

import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Input } from "@/components/atoms/shadcn/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import { QuestionBankStep } from "@/components/organisms/QuestionBankStep";
import { StepSetup, type SetupStep } from "@/components/organisms/StepSetup";
import { playableOf } from "@/lib/morris/game";
import { DEFAULT_NAMES, useMorrisStore } from "@/lib/morris/store";
import { DEFAULT_QUESTIONS } from "@/lib/questions/default-questions";
import { activeQuestions, useSelectedBank } from "@/lib/questions/library";
import {
  DIFFICULTIES,
  DIFFICULTY_CAP_LABEL,
  type Difficulty,
  type Question,
} from "@/lib/questions/types";
import { SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { useZhuyinPreferences } from "@/lib/zhuyin";
import { Accessibility, Library, SlidersHorizontal } from "lucide-react";

const MIN_QUESTIONS = 6;
/** 要當場判對錯：只出選擇與是非 */
const playableAll = (questions: Question[]) => playableOf(questions, "hard");

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { bankId, cap, names, selectBank, setCap, setName } = useMorrisStore();
  const zhuyin = useZhuyinPreferences((state) => state.units["/quiz/morris"] ?? false);
  const saved = useSelectedBank(bankId);
  const active = saved ? activeQuestions(saved) : DEFAULT_QUESTIONS;
  const playable = playableOf(active, cap);

  const blocker =
    playable.length < MIN_QUESTIONS
      ? playableAll(active).length < MIN_QUESTIONS
        ? `這份題庫只有 ${playableAll(active).length} 題選擇或是非題，至少要 ${MIN_QUESTIONS} 題`
        : `這個難度上限只有 ${playable.length} 題，至少要 ${MIN_QUESTIONS} 題`
      : !names[0].trim() || !names[1].trim()
        ? "兩隊都要有名字"
        : null;

  const steps: SetupStep[] = [
    {
      key: "bank",
      label: "題庫",
      icon: Library,
      summary: `${saved ? saved.title : "內建題庫"} ${playableAll(active).length} 題`,
      done: playable.length >= MIN_QUESTIONS,
      content: (
        <QuestionBankStep
          builtIn={DEFAULT_QUESTIONS}
          playable={playableAll}
          bankId={bankId}
          onSelect={selectBank}
          allowShort={false}
          templateName="圈叉搶答題庫範本.xlsx"
        />
      ),
    },
    {
      key: "rules",
      label: "遊戲設定",
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
    {
      // 兩隊題目不同，不朗讀；輔助只剩 StepSetup 接在後面的注音開關
      key: "assist",
      label: "輔助",
      icon: Accessibility,
      summary: zhuyin ? "注音" : "不標注音",
      content: (
        <header>
          <h3 className="text-h3 text-ink">需要哪些輔助？</h3>
        </header>
      ),
    },
  ];

  return (
    <StepSetup
      title="圈叉搶答設定"
      zhuyinStepKey="assist"
      zhuyinPosition="after"
      steps={steps}
      blocker={blocker}
      startLabel="開始比賽"
      onStart={onStart}
      share={{
        unit: "quiz-morris",
        setup: { bank: saved ? activeQuestions(saved) : null, title: saved?.title, cap, names },
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
