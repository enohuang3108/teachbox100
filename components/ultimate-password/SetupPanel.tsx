"use client";

import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Input } from "@/components/atoms/shadcn/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import { useAssistStep } from "@/components/organisms/AssistStep";
import { QuestionBankStep } from "@/components/organisms/QuestionBankStep";
import { StepSetup, type SetupStep } from "@/components/organisms/StepSetup";
import { activeQuestions, useSelectedBank } from "@/lib/questions/library";
import {
  rangeError,
  TIME_LIMITS,
  type TimeLimit,
} from "@/lib/ultimate-password/game";
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
import { useState } from "react";

/** 答對題目才能猜密碼：只出選擇與是非 */
const playableAll = (questions: Question[]) => playableOf(questions, "hard");

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const {
    bankId,
    cap,
    selectBank,
    setCap,
    low,
    high,
    setRange,
    minutes,
    setMinutes,
  } = useUltimatePasswordStore();
  // 輸入框留原字：清空重打的途中不該被改成 0；合法才寫回 store
  const [lowText, setLowText] = useState(String(low));
  const [highText, setHighText] = useState(String(high));
  const typed = {
    low: lowText === "" ? NaN : Number(lowText),
    high: highText === "" ? NaN : Number(highText),
  };
  const rangeProblem = rangeError(typed);
  const editRange = (nextLow: string, nextHigh: string) => {
    setLowText(nextLow);
    setHighText(nextHigh);
    const next = { low: Number(nextLow), high: Number(nextHigh) };
    if (nextLow !== "" && nextHigh !== "" && !rangeError(next))
      setRange(next.low, next.high);
  };
  const assist = useAssistStep();
  const saved = useSelectedBank(bankId);
  const active = saved ? activeQuestions(saved) : ULTIMATE_PASSWORD_QUESTIONS;
  const playable = playableOf(active, cap);

  const blocker =
    playable.length === 0
      ? playableAll(active).length === 0
        ? "這份題庫沒有勾選可用的題目（只收選擇題與是非題）"
        : "這個難度上限抽不到題目，放寬一點"
      : rangeProblem && `密碼範圍：${rangeProblem}`;

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
      summary: `${DIFFICULTY_CAP_LABEL[cap]}・${low}–${high}・${minutes ? `限時 ${minutes} 分鐘` : "不限時"}`,
      done: !rangeProblem,
      content: (
        <section className="space-y-8">
          <div className="space-y-5">
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
          </div>

          <div className="space-y-3">
            <h3 className="text-h3 text-ink">密碼藏在哪個範圍？</h3>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                inputMode="numeric"
                aria-label="最小值"
                className="w-28 text-center text-body-lg tabular-nums"
                value={lowText}
                aria-invalid={!!rangeProblem}
                onChange={(e) => editRange(e.target.value, highText)}
              />
              <span className="text-body-lg text-ink">到</span>
              <Input
                type="number"
                inputMode="numeric"
                aria-label="最大值"
                className="w-28 text-center text-body-lg tabular-nums"
                value={highText}
                aria-invalid={!!rangeProblem}
                onChange={(e) => editRange(lowText, e.target.value)}
              />
            </div>
            {rangeProblem && (
              <p role="alert" className="text-caption text-danger-ink">
                {rangeProblem}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <header>
              <h3 className="text-h3 text-ink">要不要限時？</h3>
              <DialogDescription className="mt-1">
                從開始遊戲算起，時間到還沒破解，密碼就爆炸、這局結束。
              </DialogDescription>
            </header>
            <RadioGroup
              value={String(minutes)}
              onValueChange={(v) => setMinutes(Number(v) as TimeLimit)}
              className="flex flex-wrap gap-2"
            >
              {TIME_LIMITS.map((m) => (
                <label key={m} className="group" htmlFor={`password-time-${m}`}>
                  <span
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-hover",
                      SELECTED_OPTION,
                    )}
                  >
                    <RadioGroupItem
                      value={String(m)}
                      id={`password-time-${m}`}
                    />
                    <span className="text-sm font-medium">
                      {m ? `${m} 分鐘` : "不限時"}
                    </span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>
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
        setup: {
          bank: saved ? activeQuestions(saved) : null,
          title: saved?.title,
          cap,
          low,
          high,
          minutes,
        },
      }}
    />
  );
}
