"use client";

import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Checkbox } from "@/components/atoms/shadcn/checkbox";
import { Input } from "@/components/atoms/shadcn/input";
import { Switch } from "@/components/atoms/shadcn/switch";
import { defaultCharacterId } from "@/lib/monopoly/characters";
import { DEFAULT_QUESTIONS } from "@/lib/monopoly/default-questions";
import { useMonopolyStore } from "@/lib/monopoly/store";
import {
  DIFFICULTIES,
  DIFFICULTY_CAP_LABEL,
  DIFFICULTY_LABEL,
  difficultyOf,
  PLAYER_COLORS,
  type EndCondition,
  type PlayerInput,
  type Question,
} from "@/lib/monopoly/types";
import { cn } from "@/lib/utils";
import {
  Coins,
  Library,
  Plus,
  Repeat,
  SlidersHorizontal,
  Timer,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { PASS_START_QUIZ_BONUS } from "@/lib/monopoly/rules";
import { StepSetup, type SetupStep } from "@/components/organisms/StepSetup";
import { DIFFICULTY_DOT } from "@/components/organisms/QuestionPreview";
import { useAssistStep } from "@/components/organisms/AssistStep";
import { QuestionBankStep } from "@/components/organisms/QuestionBankStep";
import { activeQuestions, useSelectedBank } from "@/lib/questions/library";
import { CharacterPicker } from "./CharacterPicker";
import { ColorPicker } from "./ColorPicker";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 20;
const PRESS =
  "transition-transform duration-press ease-out active:scale-[0.97]";

const END_OPTIONS: {
  type: EndCondition["type"];
  label: string;
  icon: typeof Timer;
  initial: EndCondition;
}[] = [
  {
    type: "time",
    label: "時間到",
    icon: Timer,
    initial: { type: "time", minutes: 40 },
  },
  {
    type: "moneyGoal",
    label: "金額達標",
    icon: Coins,
    initial: { type: "moneyGoal", amount: 50000 },
  },
  {
    type: "lastOneStanding",
    label: "最後存活者",
    icon: Trophy,
    initial: { type: "lastOneStanding" },
  },
  {
    type: "laps",
    label: "完成圈數",
    icon: Repeat,
    initial: { type: "laps", count: 3 },
  },
];

/** 大富翁三種題型都出 */
const everyQuestion = (questions: Question[]) => questions;

/** 長得跟 shadcn TabsList 一樣，但語意是單選（沒有對應的分頁內容），所以用 radiogroup */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "md",
}: {
  label: string;
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex h-9 w-fit items-center rounded-lg bg-muted p-[3px]"
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex h-full items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-[color,box-shadow,transform] duration-hover ease-out active:scale-[0.97]",
              size === "sm" ? "px-2.5 text-caption" : "px-4 text-sm",
              on
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-sm font-semibold text-ink">{children}</span>
      {hint && (
        <span className="text-caption text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}

function endSummary(ec: EndCondition) {
  switch (ec.type) {
    case "time":
      return `${ec.minutes} 分鐘`;
    case "moneyGoal":
      return `$${ec.amount.toLocaleString()} 達標`;
    case "lastOneStanding":
      return "最後存活者";
    case "laps":
      return `${ec.count} 圈`;
  }
}


export function SetupPanel() {
  const {
    draftSettings,
    bankId,
    draftPlayers,
    selectBank,
    updateSettings,
    setPlayers,
    begin,
  } = useMonopolyStore();
  const assist = useAssistStep();
  const saved = useSelectedBank(bankId);

  const playerCount = draftSettings.playerCount;

  // 舊 persist 可能人數與玩家列不同步、或缺 character；補齊才開得了局
  useEffect(() => {
    if (
      draftPlayers.length !== playerCount ||
      draftPlayers.some((p) => !p.character)
    ) {
      setPlayers(
        Array.from({ length: playerCount }, (_, i) => {
          const existing = draftPlayers[i];
          if (existing) {
            return existing.character
              ? existing
              : { ...existing, character: defaultCharacterId(i) };
          }
          return newPlayer(i, draftPlayers);
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerCount]);

  function newPlayer(i: number, others: PlayerInput[]): PlayerInput {
    const usedColors = others.map((p) => p.color);
    const usedChars = others.map((p) => p.character);
    return {
      name: `玩家${i + 1}`,
      color:
        PLAYER_COLORS.find((c) => !usedColors.includes(c)) ??
        PLAYER_COLORS[i % PLAYER_COLORS.length],
      character:
        Array.from({ length: 40 }, (_, k) => defaultCharacterId(i + k)).find(
          (id) => !usedChars.includes(id),
        ) ?? defaultCharacterId(i),
      difficulty: "normal",
    };
  }

  function writePlayers(next: PlayerInput[]) {
    setPlayers(next);
    updateSettings({ playerCount: next.length });
  }

  function updatePlayer(index: number, patch: Partial<PlayerInput>) {
    setPlayers(
      draftPlayers.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  }

  const questions = saved ? activeQuestions(saved) : DEFAULT_QUESTIONS;
  const ec = draftSettings.endCondition;
  const differentiated = draftSettings.differentiated ?? false;
  const passStartQuiz = draftSettings.passStartQuiz ?? true;
  const quizBonus = draftSettings.passStartQuizBonus ?? PASS_START_QUIZ_BONUS;
  const bankLevels = DIFFICULTIES.filter((d) =>
    questions.some((q) => difficultyOf(q) === d),
  );
  const bankDone = questions.length > 0;
  const playersDone =
    draftPlayers.length >= MIN_PLAYERS &&
    draftPlayers.every((p) => p.name.trim());
  const blocker = !bankDone
    ? "這份題庫沒有勾選任何題目"
    : !playersDone
      ? "玩家至少 2 位，而且都要有名字"
      : null;

  const steps: SetupStep[] = [
    {
      key: "bank",
      label: "題庫",
      icon: Library,
      summary: `${saved ? saved.title : "內建題庫"} ${questions.length} 題`,
      done: bankDone,
      content: (
        <QuestionBankStep
          builtIn={DEFAULT_QUESTIONS}
          playable={everyQuestion}
          bankId={bankId}
          onSelect={selectBank}
          allowShort
          templateName="大富翁題庫範本.xlsx"
        />
      ),
    },
    {
      key: "players",
      label: "玩家",
      icon: Users,
      summary: `${draftPlayers.length} 位`,
      done: playersDone,
      content: (
        <section className="space-y-5">
          <header className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-h3 text-ink">誰要一起玩？</h3>
              <DialogDescription className="mt-1">
                點頭像換角色、點色塊換顏色。
              </DialogDescription>
            </div>
            <span className="shrink-0 text-caption text-muted-foreground">
              {draftPlayers.length}／{MAX_PLAYERS}
            </span>
          </header>

          {/* 差異化教學預設關；打開才出現每位學生的難度，避免第一次來的老師被多一排按鈕嚇到 */}
          <div className="rounded-2xl border border-border bg-background">
            <label className="flex cursor-pointer items-start gap-3 px-4 py-3.5">
              <Checkbox
                checked={differentiated}
                onCheckedChange={(v) =>
                  updateSettings({ differentiated: v === true })
                }
                className="mt-1"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">
                  差異化教學
                </span>
                <span className="mt-0.5 block text-caption text-muted-foreground">
                  依學生程度出題：替每位玩家設一個難度上限，輪到誰就從他的範圍抽題。不打勾就從整份題庫隨機出題。
                </span>
              </span>
            </label>
            {differentiated && (
              <div className="space-y-2 border-t border-dashed border-border px-4 py-3 animate-in fade-in-0 duration-200">
                <ul className="list-disc space-y-0.5 pl-5 text-caption text-muted-foreground">
                  <li>
                    「簡單」只抽簡單題；「普通以下」抽簡單和普通；「困難以下」三級都抽。
                  </li>
                  <li>題庫 Excel 的「難度」欄沒填的題目算普通。</li>
                  <li>範圍內一題都沒有時，改從整份題庫抽，遊戲不會卡住。</li>
                  <li>難度只在這裡看得到，學生答題時不會顯示。</li>
                </ul>
                {bankLevels.length === 1 && (
                  <p className="rounded-xl bg-warning-soft px-3 py-2 text-caption text-warning-ink">
                    目前的題庫只有「{DIFFICULTY_LABEL[bankLevels[0]]}
                    」題，分級不會有效果。要分級請到「題庫」匯入有標難度的
                    Excel。
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-caption text-muted-foreground">
                  全部設為
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setPlayers(
                          draftPlayers.map((p) => ({
                            ...p,
                            difficulty: d,
                          })),
                        )
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-semibold text-ink hover:bg-accent",
                        PRESS,
                      )}
                    >
                      <span
                        className={cn("size-2 rounded-full", DIFFICULTY_DOT[d])}
                      />
                      {DIFFICULTY_CAP_LABEL[d]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ul className="divide-y divide-dashed divide-border rounded-2xl border border-border bg-background">
            {draftPlayers.map((p, i) => {
              const others = draftPlayers.filter((_, j) => j !== i);
              return (
                <li
                  key={i}
                  className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 px-3 py-2.5 sm:flex"
                >
                  <CharacterPicker
                    value={p.character ?? defaultCharacterId(i)}
                    color={p.color}
                    takenByOthers={others.map((o) => o.character)}
                    onSelect={(id) => updatePlayer(i, { character: id })}
                  />
                  <ColorPicker
                    value={p.color}
                    takenByOthers={others.map((o) => o.color)}
                    onSelect={(c) => updatePlayer(i, { color: c })}
                  />
                  <Input
                    aria-label={`第 ${i + 1} 位玩家名字`}
                    value={p.name}
                    maxLength={20}
                    onChange={(e) => updatePlayer(i, { name: e.target.value })}
                    className="h-9 min-w-0 flex-1 border-transparent bg-transparent shadow-none hover:bg-muted/60 focus-visible:bg-card"
                  />
                  {differentiated && (
                    <div className="order-last col-span-full sm:order-none">
                      <Segmented
                        size="sm"
                        label={`${p.name} 的難度`}
                        value={p.difficulty ?? "normal"}
                        onChange={(d) => updatePlayer(i, { difficulty: d })}
                        options={DIFFICULTIES.map((d) => ({
                          value: d,
                          label: (
                            <>
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  DIFFICULTY_DOT[d],
                                )}
                              />
                              {DIFFICULTY_CAP_LABEL[d]}
                            </>
                          ),
                        }))}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label={`移除 ${p.name}`}
                    disabled={draftPlayers.length <= MIN_PLAYERS}
                    onClick={() =>
                      writePlayers(draftPlayers.filter((_, j) => j !== i))
                    }
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent",
                      PRESS,
                    )}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            disabled={draftPlayers.length >= MAX_PLAYERS}
            onClick={() =>
              writePlayers([
                ...draftPlayers,
                newPlayer(draftPlayers.length, draftPlayers),
              ])
            }
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/60 hover:text-ink disabled:opacity-40",
              PRESS,
            )}
          >
            <Plus className="size-4" aria-hidden />
            {draftPlayers.length >= MAX_PLAYERS
              ? `最多 ${MAX_PLAYERS} 位`
              : "新增玩家"}
          </button>
        </section>
      ),
    },
    {
      key: "rules",
      label: "遊戲設定",
      icon: SlidersHorizontal,
      summary: endSummary(ec),
      content: (
        <section className="space-y-7">
          <header>
            <h3 className="text-h3 text-ink">怎麼玩、玩多久？</h3>
            <DialogDescription className="mt-1">
              骰子、起始金額、經過起點與結束條件。
            </DialogDescription>
          </header>

          <div>
            <div>
              <FieldLabel>骰子</FieldLabel>
              <Segmented
                label="骰子數量"
                value={String(draftSettings.diceCount) as "1" | "2"}
                onChange={(v) =>
                  updateSettings({ diceCount: Number(v) as 1 | 2 })
                }
                options={[
                  { value: "1", label: "1 顆" },
                  { value: "2", label: "2 顆" },
                ]}
              />
            </div>
          </div>

          <div>
            <FieldLabel>起始金額</FieldLabel>
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink">
              每人開局拿
              <NumberField
                label="元"
                prefix="$"
                value={draftSettings.startingMoney}
                min={1000}
                step={1000}
                onChange={(startingMoney) => updateSettings({ startingMoney })}
              />
            </div>
          </div>

          {/* 經過起點：加碼題可關；開著時答對、答錯各一個金額，關掉只剩一個 */}
          <div>
            <FieldLabel>經過起點</FieldLabel>
            <div className="rounded-2xl border border-border bg-background">
              <label className="flex cursor-pointer items-start justify-between gap-4 px-4 py-3.5">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    加碼題
                  </span>
                  <span className="mt-0.5 block text-caption text-muted-foreground">
                    {passStartQuiz
                      ? "走過或停在起點時，棋子先停下來答一題，依答對或答錯拿下面的金額。"
                      : "走過或停在起點時不出題，直接拿下面的金額，遊戲節奏比較快。"}
                  </span>
                </span>
                <Switch
                  checked={passStartQuiz}
                  onCheckedChange={(v) => updateSettings({ passStartQuiz: v })}
                  className="mt-0.5"
                />
              </label>
              {passStartQuiz && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border px-4 py-3">
                  <span className="text-sm text-ink">答對加碼</span>
                  <NumberField
                    label="元"
                    prefix="$"
                    value={quizBonus}
                    min={0}
                    step={500}
                    onChange={(passStartQuizBonus) =>
                      updateSettings({ passStartQuizBonus })
                    }
                  />
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border px-4 py-3">
                <span className="text-sm text-ink">
                  {passStartQuiz ? "答錯" : "經過起點獎勵"}
                </span>
                <NumberField
                  label="元"
                  prefix="$"
                  value={draftSettings.passStartBonus}
                  min={0}
                  step={500}
                  onChange={(passStartBonus) =>
                    updateSettings({ passStartBonus })
                  }
                />
              </div>
              {passStartQuiz && draftSettings.passStartBonus > quizBonus && (
                <p className="border-t border-dashed border-border px-4 py-2.5 text-caption text-warning-ink">
                  答錯拿的比答對多，學生可能會故意答錯。
                </p>
              )}
            </div>
          </div>

          <div>
            <FieldLabel>結束條件</FieldLabel>
            {/* 四張一樣大的卡只負責「選哪種」；數值統一放在下面那一列，選不同卡時版面不跳 */}
            <div
              role="radiogroup"
              aria-label="結束條件"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {END_OPTIONS.map((o) => {
                const on = ec.type === o.type;
                const Icon = o.icon;
                return (
                  <button
                    key={o.type}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() =>
                      !on && updateSettings({ endCondition: o.initial })
                    }
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-hover ease-out active:scale-[0.97]",
                      on
                        ? "border-ink bg-background text-ink"
                        : "border-border bg-background text-muted-foreground hover:text-ink",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    {o.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex min-h-12 flex-wrap items-center gap-x-2 gap-y-2 rounded-2xl bg-muted/60 px-4 py-2 text-sm text-ink">
              {ec.type === "time" && (
                <>
                  開始後
                  <NumberField
                    label="分鐘"
                    value={ec.minutes}
                    min={1}
                    max={180}
                    onChange={(minutes) =>
                      updateSettings({
                        endCondition: { type: "time", minutes },
                      })
                    }
                  />
                  結束，錢最多的人獲勝
                </>
              )}
              {ec.type === "moneyGoal" && (
                <>
                  有人的錢達到
                  <NumberField
                    label="元"
                    prefix="$"
                    value={ec.amount}
                    min={1000}
                    step={1000}
                    onChange={(amount) =>
                      updateSettings({
                        endCondition: { type: "moneyGoal", amount },
                      })
                    }
                  />
                  就結束
                </>
              )}
              {ec.type === "lastOneStanding" && (
                <span className="text-muted-foreground">
                  其他人都破產、只剩一位玩家時結束，不用設定數值
                </span>
              )}
              {ec.type === "laps" && (
                <>
                  有人走完
                  <NumberField
                    label="圈"
                    value={ec.count}
                    min={1}
                    max={20}
                    onChange={(count) =>
                      updateSettings({
                        endCondition: { type: "laps", count },
                      })
                    }
                  />
                  就結束
                </>
              )}
            </div>
          </div>
        </section>
      ),
    },
    assist,
  ];

  return (
    <>
      <StepSetup
        title="大富翁設定"
        zhuyinStepKey="assist"
        zhuyinPosition="after"
        steps={steps}
        blocker={blocker}
        startLabel="開始遊戲"
        share={{
          unit: "monopoly",
          setup: {
            settings: draftSettings,
            players: draftPlayers,
            questions: saved ? questions : null,
            title: saved?.title,
          },
        }}
        onStart={() => begin(questions)}
      />
    </>
  );
}

function NumberField({
  label,
  prefix,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  prefix?: string;
  value: number;
  min: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex h-9 items-center gap-1.5 rounded-xl bg-muted px-3 focus-within:ring-2 focus-within:ring-ring">
      {prefix && (
        <span className="text-sm text-muted-foreground">{prefix}</span>
      )}
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value) || min;
          onChange(Math.max(min, max ? Math.min(max, n) : n));
        }}
        className="w-16 min-w-0 bg-transparent text-sm font-semibold text-ink tabular-nums outline-none"
      />
      <span className="text-caption text-muted-foreground">{label}</span>
    </label>
  );
}
