"use client";

import { Input } from "@/components/atoms/shadcn/input";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import { useAssistStep } from "@/components/organisms/AssistStep";
import { QuestionBankStep } from "@/components/organisms/QuestionBankStep";
import { StepSetup, type SetupStep } from "@/components/organisms/StepSetup";
import { DEFAULT_QUESTIONS } from "@/lib/questions/default-questions";
import { activeQuestions, useSelectedBank } from "@/lib/questions/library";
import {
  DIFFICULTIES,
  DIFFICULTY_CAP_LABEL,
  type Difficulty,
  type Question,
} from "@/lib/questions/types";
import {
  BOARD_SIZES,
  boardCells,
  gridFor,
  playableOf,
  type BoardSize,
} from "@/lib/territory/rules";
import {
  COUNTDOWNS,
  DEFAULT_NAMES,
  useTerritoryStore,
  type Countdown,
} from "@/lib/territory/store";
import { SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { Library, SlidersHorizontal } from "lucide-react";

/** 搶答要當場判對錯：只出選擇與是非 */
const playableAll = (questions: Question[]) => playableOf(questions, "hard");

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const {
    bankId,
    cap,
    names,
    countdown,
    size,
    selectBank,
    setCap,
    setName,
    setCountdown,
    setSize,
  } = useTerritoryStore();
  const assist = useAssistStep();

  const saved = useSelectedBank(bankId);
  const active = saved ? activeQuestions(saved) : DEFAULT_QUESTIONS;
  // 只有能自動判對錯的題目才進得了這個單元，難度上限也在這裡先套用
  const playable = playableOf(active, cap);
  // 跟開局用同一個螢幕比例算，這裡寫的就是全螢幕時會看到的棋盤
  const aspect = window.screen.width / window.screen.height;
  const grid = gridFor(boardCells(size, playable.length), aspect);
  // 選項直接寫這台螢幕會排成幾乘幾，老師不用猜「小」有多小
  const gridLabel = (s: BoardSize) => {
    const g = gridFor(boardCells(s, playable.length), aspect);
    return `${g.cols}×${g.rows}`;
  };

  const blocker =
    playable.length === 0
      ? playableAll(active).length === 0
        ? "這份題庫沒有勾選可用的題目（只收選擇題與是非題）"
        : "這個難度上限抽不到題目，放寬一點"
      : !names[0].trim() || !names[1].trim()
        ? "兩隊都要有名字"
        : null;

  const steps: SetupStep[] = [
    {
      key: "bank",
      label: "題庫",
      icon: Library,
      summary: `${saved ? saved.title : "內建題庫"} ${playableAll(active).length} 題`,
      done: playable.length > 0,
      content: (
        <QuestionBankStep
          builtIn={DEFAULT_QUESTIONS}
          playable={playableAll}
          bankId={bankId}
          onSelect={selectBank}
          allowShort={false}
          templateName="領地戰題庫範本.xlsx"
        />
      ),
    },
    {
      key: "rules",
      label: "遊戲設定",
      icon: SlidersHorizontal,
      summary: `${playable.length} 題・棋盤 ${grid.cols}×${grid.rows}・倒數 ${countdown} 秒`,
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

          <Field
            label="場地大小"
            hint="自動會照題數決定"
            value={size}
            onChange={(v) => setSize(v as BoardSize)}
            options={(Object.keys(BOARD_SIZES) as BoardSize[]).map((s) => ({
              value: s,
              label: `${BOARD_SIZES[s].label}・${gridLabel(s)}`,
            }))}
          />

          <Field
            label="每題倒數"
            hint="開啟朗讀時唸完再倒數，倒數後才顯示選項"
            value={String(countdown)}
            onChange={(v) => setCountdown(Number(v) as Countdown)}
            options={COUNTDOWNS.map((c) => ({ value: String(c), label: `${c} 秒` }))}
          />
        </section>
      ),
    },
    assist,
  ];

  return (
    <StepSetup
      title="領地戰設定"
      zhuyinStepKey="assist"
      zhuyinPosition="after"
      steps={steps}
      blocker={blocker}
      startLabel="開始比賽"
      onStart={onStart}
      share={{
        unit: "quiz-territory",
        setup: {
          bank: saved ? activeQuestions(saved) : null,
          title: saved?.title,
          cap,
          names,
          countdown,
          size,
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
