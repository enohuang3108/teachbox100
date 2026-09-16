"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { Checkbox } from "@/components/atoms/shadcn/checkbox";
import { Input } from "@/components/atoms/shadcn/input";
import { Switch } from "@/components/atoms/shadcn/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/shadcn/tabs";
import { defaultCharacterId } from "@/lib/monopoly/characters";
import { DEFAULT_QUESTIONS } from "@/lib/monopoly/default-questions";
import {
  AI_QUESTION_PROMPT,
  buildTemplateBlob,
  parseQuestions,
  rowsFromFile,
} from "@/lib/monopoly/excel";
import { useMonopolyStore } from "@/lib/monopoly/store";
import {
  DIFFICULTIES,
  DIFFICULTY_CAP_LABEL,
  DIFFICULTY_LABEL,
  difficultyOf,
  PLAYER_COLORS,
  type Difficulty,
  type EndCondition,
  type PlayerInput,
  type Question,
} from "@/lib/monopoly/types";
import { cn } from "@/lib/utils";
import {
  Check,
  Coins,
  Download,
  Library,
  Plus,
  Repeat,
  SlidersHorizontal,
  Timer,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PASS_START_QUIZ_BONUS } from "@/lib/monopoly/rules";
import { CharacterPicker } from "./CharacterPicker";
import { ColorPicker } from "./ColorPicker";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 20;
const PRESS =
  "transition-transform duration-press ease-out active:scale-[0.97]";

// 難度點的顏色只給老師看（題目視窗不顯示），學生之間不會互相比較
const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: "bg-success",
  normal: "bg-warning",
  hard: "bg-danger",
};

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

type Step = "bank" | "players" | "rules";
type Source = "default" | "custom";

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

function QuestionPreview({ questions }: { questions: Question[] }) {
  const counts = DIFFICULTIES.map(
    (d) => [d, questions.filter((q) => difficultyOf(q) === d).length] as const,
  );
  return (
    <div className="rounded-2xl border border-border bg-background">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-dashed border-border px-4 py-3">
        <span className="text-sm font-semibold text-ink">
          共 {questions.length} 題
        </span>
        {counts.map(([d, n]) => (
          <span
            key={d}
            className="flex items-center gap-1.5 text-caption text-muted-foreground"
          >
            <span className={cn("size-2 rounded-full", DIFFICULTY_DOT[d])} />
            {DIFFICULTY_LABEL[d]} {n}
          </span>
        ))}
      </div>
      <details className="group px-4 py-3">
        <summary className="cursor-pointer text-caption text-muted-foreground">
          預覽題目
        </summary>
        <div className="mt-2 max-h-60 overflow-auto">
          <table className="w-full border-collapse text-caption">
            <tbody>
              {questions.map((q, i) => (
                <tr key={q.id} className="border-b border-border/50">
                  <td className="p-1 align-top text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="p-1 align-top">
                    <span
                      aria-label={DIFFICULTY_LABEL[difficultyOf(q)]}
                      className={cn(
                        "mt-1.5 inline-block size-2 rounded-full",
                        DIFFICULTY_DOT[difficultyOf(q)],
                      )}
                    />
                  </td>
                  <td className="p-1 align-top">
                    {q.text}
                    {q.options && (
                      <span className="text-muted-foreground">
                        {" "}
                        （{q.options.join("／")}）
                      </span>
                    )}
                  </td>
                  <td className="p-1 align-top text-muted-foreground">
                    {q.answer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export function SetupPanel() {
  const {
    draftSettings,
    draftQuestions,
    draftPlayers,
    importQuestions,
    updateSettings,
    setPlayers,
    begin,
  } = useMonopolyStore();
  const [step, setStep] = useState<Step>("bank");
  const [source, setSource] = useState<Source>(
    draftQuestions.length > 0 ? "custom" : "default",
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [promptOpen, setPromptOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);

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

  async function readFile(file: File | undefined) {
    if (!file) return;
    setErrors([]);
    try {
      const result = parseQuestions(await rowsFromFile(file));
      if (result.ok) {
        importQuestions(result.questions);
      } else {
        setErrors(result.errors.map((er) => `第 ${er.row} 列：${er.message}`));
        importQuestions([]);
      }
    } catch {
      setErrors(["檔案讀取失敗，請確認為 .xlsx 格式"]);
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(buildTemplateBlob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "大富翁題庫範本.xlsx";
    a.click();
    URL.revokeObjectURL(url);
    setCopied(false);
    setPromptOpen(true);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(AI_QUESTION_PROMPT);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const questions = source === "default" ? DEFAULT_QUESTIONS : draftQuestions;
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
    ? "還沒匯入題庫"
    : !playersDone
      ? "玩家至少 2 位，而且都要有名字"
      : null;

  const steps: {
    key: Step;
    label: string;
    icon: typeof Library;
    summary: string;
    done: boolean;
  }[] = [
    {
      key: "bank",
      label: "題庫",
      icon: Library,
      summary:
        source === "default"
          ? `預設 ${DEFAULT_QUESTIONS.length} 題`
          : bankDone
            ? `自訂 ${draftQuestions.length} 題`
            : "尚未匯入",
      done: bankDone,
    },
    {
      key: "players",
      label: "玩家",
      icon: Users,
      summary: `${draftPlayers.length} 位`,
      done: playersDone,
    },
    {
      key: "rules",
      label: "規則",
      icon: SlidersHorizontal,
      summary: endSummary(ec),
      done: true,
    },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);
  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="grid h-[min(680px,90dvh)] grid-rows-[auto_1fr] md:grid-cols-[232px_1fr] md:grid-rows-1">
      {/* 側欄：旅程三站，隨時可跳；每站底下一行寫目前設了什麼 */}
      <nav
        aria-label="設定步驟"
        className="flex gap-1 border-b border-border bg-muted/60 p-3 pr-12 md:flex-col md:pr-4 md:border-r md:border-b-0 md:p-4"
      >
        <DialogTitle className="sr-only font-display text-h3 text-ink md:not-sr-only md:mb-4 md:px-2 md:pt-1">
          遊戲設定
        </DialogTitle>
        {steps.map((s, i) => {
          const on = s.key === step;
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              type="button"
              aria-current={on ? "step" : undefined}
              onClick={() => setStep(s.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-2 py-2 md:justify-start md:gap-3 md:px-3 md:py-2.5 text-left transition-[background-color,transform] duration-hover ease-out active:scale-[0.97] md:flex-none",
                on ? "bg-secondary" : "hover:bg-secondary/50",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg md:size-8",
                  on
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <span className="hidden text-muted-foreground md:inline">
                    {i + 1}
                  </span>
                  {s.label}
                  {s.done && s.key !== "rules" && (
                    <Check
                      className="hidden size-3.5 text-success md:block"
                      aria-label="已完成"
                    />
                  )}
                </span>
                <span className="hidden truncate text-caption text-muted-foreground md:block">
                  {s.summary}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="grid min-h-0 grid-rows-[1fr_auto]">
        <div
          key={step}
          className="min-h-0 overflow-y-auto px-5 py-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 motion-reduce:slide-in-from-bottom-0 md:px-8"
        >
          {step === "bank" && (
            <section className="space-y-5">
              <header>
                <h3 className="text-h3 text-ink">要用哪份題庫？</h3>
                <DialogDescription className="mt-1">
                  先用預設題庫試玩，或匯入自己出的
                  Excel。每題可標簡單／普通／困難，給不同程度的學生抽。
                </DialogDescription>
              </header>
              <Tabs
                value={source}
                onValueChange={(v) => setSource(v as Source)}
                className="gap-4"
              >
                <TabsList aria-label="題庫來源">
                  <TabsTrigger value="default" className="px-4">
                    預設題庫
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="px-4">
                    自訂題庫
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="default">
                  <QuestionPreview questions={DEFAULT_QUESTIONS} />
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
                    <Upload
                      className="size-6 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="text-sm font-semibold text-ink">
                      {draftQuestions.length > 0
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
                      沒有題庫？下載範本會附一段提示詞，貼給 ChatGPT 或 Claude
                      就能出題。
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("rounded-full", PRESS)}
                      onClick={downloadTemplate}
                    >
                      <Download className="size-4" aria-hidden />
                      下載範本
                    </Button>
                  </div>
                  {errors.length > 0 && (
                    <ul className="max-h-40 overflow-y-auto rounded-xl bg-danger-soft px-4 py-3 text-sm leading-[1.75] text-danger-ink">
                      {errors.map((er, i) => (
                        <li key={i}>{er}</li>
                      ))}
                    </ul>
                  )}
                  {draftQuestions.length > 0 && (
                    <QuestionPreview questions={draftQuestions} />
                  )}
                </TabsContent>
              </Tabs>
            </section>
          )}

          {step === "players" && (
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
                      <li>
                        範圍內一題都沒有時，改從整份題庫抽，遊戲不會卡住。
                      </li>
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
                            className={cn(
                              "size-2 rounded-full",
                              DIFFICULTY_DOT[d],
                            )}
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
                        onChange={(e) =>
                          updatePlayer(i, { name: e.target.value })
                        }
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
          )}

          {step === "rules" && (
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
                    onChange={(startingMoney) =>
                      updateSettings({ startingMoney })
                    }
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
                      onCheckedChange={(v) =>
                        updateSettings({ passStartQuiz: v })
                      }
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
                  {passStartQuiz &&
                    draftSettings.passStartBonus > quizBonus && (
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
          )}
        </div>

        {/* 固定底列：左邊一句話總結，按下去之前看得到自己設了什麼 */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-5 py-3 md:px-8">
          <p className="min-w-0 truncate text-caption text-muted-foreground">
            {blocker ? (
              <span className="text-danger-ink">{blocker}</span>
            ) : (
              steps.map((s) => s.summary).join("・")
            )}
          </p>
          <div className="ml-auto flex gap-2">
            {stepIndex > 0 && (
              <Button
                variant="ghost"
                className={cn("rounded-full", PRESS)}
                onClick={() => setStep(steps[stepIndex - 1].key)}
              >
                上一步
              </Button>
            )}
            {isLast ? (
              <Button
                className={cn("rounded-full px-6 font-bold", PRESS)}
                disabled={!!blocker}
                onClick={() =>
                  begin(source === "default" ? DEFAULT_QUESTIONS : undefined)
                }
              >
                開始遊戲
              </Button>
            ) : (
              <Button
                className={cn("rounded-full px-6 font-bold", PRESS)}
                onClick={() => setStep(steps[stepIndex + 1].key)}
              >
                下一步
              </Button>
            )}
          </div>
        </footer>
      </div>

      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>用 AI 快速產生題庫</DialogTitle>
            <DialogDescription>
              範本已經下載。把下面的提示詞複製給 ChatGPT 或
              Claude，補上你要的主題和題數，它會做出一份
              Excel。下載後拖進上傳區就好。
            </DialogDescription>
          </DialogHeader>
          <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl bg-sand p-3 text-sm leading-[1.75]">
            {AI_QUESTION_PROMPT}
          </pre>
          <Button
            onClick={copyPrompt}
            className={cn("w-full rounded-full", PRESS)}
          >
            {copied ? "已複製！" : "複製提示詞"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
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
