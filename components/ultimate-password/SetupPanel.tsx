"use client";

import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import { useAssistStep } from "@/components/organisms/AssistStep";
import { QuestionBankStep } from "@/components/organisms/QuestionBankStep";
import { StepSetup, type SetupStep } from "@/components/organisms/StepSetup";
import { activeQuestions, useSelectedBank } from "@/lib/questions/library";
import { ULTIMATE_PASSWORD_QUESTIONS } from "@/lib/ultimate-password/questions";
import { useUltimatePasswordStore } from "@/lib/ultimate-password/store";
import {
  DIFFICULTIES,
  DIFFICULTY_CAP_LABEL,
  type Difficulty,
  type Question,
} from "@/lib/questions/types";
import { playableOf } from "@/lib/territory/rules";
import { SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Library, SlidersHorizontal } from "lucide-react";

/** 答對題目才能猜密碼：只出選擇與是非 */
const playableAll = (questions: Question[]) => playableOf(questions, "hard");

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { bankId, cap, selectBank, setCap } = useUltimatePasswordStore();
  const assist = useAssistStep();
  const saved = useSelectedBank(bankId);
  const active = saved ? activeQuestions(saved) : ULTIMATE_PASSWORD_QUESTIONS;
  const playable = playableOf(active, cap);

  const blocker =
    playable.length > 0
      ? null
      : playableAll(active).length === 0
        ? "這份題庫沒有勾選可用的題目（只收選擇題與是非題）"
        : "這個難度上限抽不到題目，放寬一點";

  const steps: SetupStep[] = [
    {
      key: "bank",
      label: "題庫",
      icon: Library,
      summary: `${saved ? saved.title : "內建題庫"} ${playableAll(active).length} 題`,
      done: playable.length > 0,
      content: (
        <QuestionBankStep
          builtIn={ULTIMATE_PASSWORD_QUESTIONS}
          playable={playableAll}
          bankId={bankId}
          onSelect={selectBank}
          allowShort={false}
          templateName="終極密碼題庫範本.xlsx"
        />
      ),
    },
    {
      key: "cap",
      label: "遊戲設定",
      icon: SlidersHorizontal,
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
              <label key={d} className="group" htmlFor={`password-cap-${d}`}>
                <span
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-hover",
                    SELECTED_OPTION,
                  )}
                >
                  <RadioGroupItem value={d} id={`password-cap-${d}`} />
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
    assist,
  ];

  return (
    <StepSetup
      title="終極密碼設定"
      zhuyinStepKey="assist"
      zhuyinPosition="after"
      steps={steps}
      blocker={blocker}
      startLabel="開始遊戲"
      onStart={onStart}
      share={{
        unit: "ultimate-password",
        setup: { bank: saved ? activeQuestions(saved) : null, title: saved?.title, cap },
      }}
    />
  );
}
