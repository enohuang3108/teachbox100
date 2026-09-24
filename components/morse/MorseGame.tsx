"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { TickSlider } from "@/components/atoms/TickSlider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/shadcn/tabs";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { useSound } from "@/lib/hooks/useSound";
import { QuestionPreview } from "@/components/organisms/QuestionPreview";
import {
  aiQuestionPrompt,
  buildTemplateBlob,
  parseQuestions,
  rowsFromFile,
} from "@/lib/questions/excel";
import {
  DIFFICULTIES,
  DIFFICULTY_CAP_LABEL,
  DIFFICULTY_LABEL,
  type Difficulty,
  type Question,
} from "@/lib/questions/types";
import { playableOf } from "@/lib/territory/rules";
import { drawQuestion as pickQuestion, playableQuestions, resolveRoundGuess, startRound, type Round } from "@/lib/morse/game";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Source = "default" | "custom";
type AnswerFeedback = {
  kind: "correct" | "wrong";
  title: string;
  detail: string;
  animated: boolean;
  duration: number;
};

const CORRECT_FEEDBACK_MS = 1000;
const WRONG_FEEDBACK_MS = 1200;

const MORSE_QUESTIONS: Question[] = [
  {
    id: "m1",
    type: "choice",
    text: "一年有幾個月？",
    options: ["10", "11", "12", "13"],
    answer: "12",
    difficulty: "easy",
  },
  {
    id: "m2",
    type: "choice",
    text: "一打雞蛋有幾顆？",
    options: ["6", "10", "12", "24"],
    answer: "12",
    difficulty: "easy",
  },
  {
    id: "m3",
    type: "boolean",
    text: "一星期有 7 天。",
    answer: "是",
    difficulty: "easy",
  },
  {
    id: "m4",
    type: "choice",
    text: "三角形有幾條邊？",
    options: ["2", "3", "4", "5"],
    answer: "3",
    difficulty: "easy",
  },
  {
    id: "m5",
    type: "choice",
    text: "九九乘法中，8 × 7 等於多少？",
    options: ["54", "56", "58", "64"],
    answer: "56",
    difficulty: "normal",
  },
  {
    id: "m6",
    type: "boolean",
    text: "一公尺等於 100 公分。",
    answer: "是",
    difficulty: "normal",
  },
  {
    id: "m7",
    type: "choice",
    text: "正方形有幾條對稱軸？",
    options: ["2", "3", "4", "6"],
    answer: "4",
    difficulty: "normal",
  },
  {
    id: "m8",
    type: "choice",
    text: "一小時有幾分鐘？",
    options: ["30", "45", "60", "100"],
    answer: "60",
    difficulty: "normal",
  },
  {
    id: "m9",
    type: "choice",
    text: "平角是幾度？",
    options: ["90", "120", "180", "360"],
    answer: "180",
    difficulty: "hard",
  },
  {
    id: "m10",
    type: "boolean",
    text: "質數 13 大於 10 且小於 20。",
    answer: "是",
    difficulty: "hard",
  },
  {
    id: "m11",
    type: "choice",
    text: "一公里是幾公尺？",
    options: ["100", "500", "1000", "10000"],
    answer: "1000",
    difficulty: "hard",
  },
  {
    id: "m12",
    type: "choice",
    text: "144 的平方根是多少？",
    options: ["10", "11", "12", "14"],
    answer: "12",
    difficulty: "hard",
  },
];

export function MorseGame() {
  const { playCorrectSound, playWrongSound } = useSound();
  const [source, setSource] = useState<Source>("default");
  const [bank, setBank] = useState<Question[]>([]);
  const [cap, setCap] = useState<Difficulty>("hard");
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answerAccepted, setAnswerAccepted] = useState(false);
  const [numberGuess, setNumberGuess] = useState(50);
  const [round, setRound] = useState<Round | null>(null);
  const [message, setMessage] = useState("");
  const [answerNumber, setAnswerNumber] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const answerTransitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (answerTransitionTimer.current) clearTimeout(answerTransitionTimer.current);
  }, []);

  const activeBank = source === "default" ? MORSE_QUESTIONS : bank;
  const range = round?.range ?? { low: 1, high: 100 };
  const playableBank = useMemo(
    () => playableQuestions(activeBank),
    [activeBank],
  );
  const playable = useMemo(
    () => playableOf(playableBank, cap),
    [playableBank, cap],
  );

  const drawQuestion = useCallback(
    (pool: Question[]) => pickQuestion(pool),
    [],
  );

  const resetGame = useCallback(() => {
    if (answerTransitionTimer.current) clearTimeout(answerTransitionTimer.current);
    answerTransitionTimer.current = null;
    setFeedback(null);
    setQuestion(drawQuestion(playable));
    setSelectedAnswer("");
    setAnswerAccepted(false);
    setNumberGuess(50);
    setRound(startRound());
    setAnswerNumber(null);
    setMessage("");
  }, [drawQuestion, playable]);

  function showFeedback(
    nextFeedback: AnswerFeedback,
    onFinish: () => void,
    delay = 0,
  ) {
    const reveal = () => {
      setFeedback(nextFeedback);
      answerTransitionTimer.current = setTimeout(() => {
        onFinish();
        setFeedback(null);
        answerTransitionTimer.current = null;
      }, nextFeedback.duration);
    };
    if (delay) answerTransitionTimer.current = setTimeout(reveal, delay);
    else reveal();
  }

  async function readFile(file?: File) {
    if (!file) return;
    setErrors([]);
    try {
      const result = parseQuestions(await rowsFromFile(file));
      if (result.ok) setBank(result.questions);
      else {
        setBank([]);
        setErrors(
          result.errors.map((error) => `第 ${error.row} 列：${error.message}`),
        );
      }
    } catch {
      setErrors(["檔案讀取失敗，請確認為 .xlsx 格式"]);
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(buildTemplateBlob({ allowShort: false }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "終極密碼題庫範本.xlsx";
    anchor.click();
    URL.revokeObjectURL(url);
    navigator.clipboard
      .writeText(aiQuestionPrompt({ allowShort: false }))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function submit(value: number, pointerActivated: boolean) {
    if (feedback) return;
    if (!question || !round) {
      setMessage(`請猜 ${range.low} 到 ${range.high} 之間的整數。`);
      return;
    }
    const result = resolveRoundGuess(value, round);
    if (!result.valid) {
      setMessage(`請猜 ${range.low} 到 ${range.high} 之間的整數。`);
      return;
    }
    if (result.correct) {
      playCorrectSound();
      setAnswerNumber(round.secret);
      setMessage("");
      return;
    }
    playWrongSound();
    const next = result.round.range;
    showFeedback({
      kind: "wrong",
      title: "沒猜中",
      detail: `密碼在 ${next.low} 到 ${next.high} 之間`,
      animated: pointerActivated,
      duration: WRONG_FEEDBACK_MS,
    }, () => {
      setRound(result.round);
      setSelectedAnswer("");
      setAnswerAccepted(false);
      setQuestion(drawQuestion(playable));
      setMessage("");
    });
  }

  function checkQuestionAnswer(value: string, pointerActivated: boolean) {
    if (!question || selectedAnswer) return;
    setSelectedAnswer(value);
    if (value === question.answer) {
      playCorrectSound();
      setMessage("");
      showFeedback({
        kind: "correct",
        title: "答對了！",
        detail: `正確答案：${question.answer}`,
        animated: pointerActivated,
        duration: CORRECT_FEEDBACK_MS,
      }, () => setAnswerAccepted(true), pointerActivated ? 160 : 0);
      return;
    }
    playWrongSound();
    showFeedback({
      kind: "wrong",
      title: "答錯了",
      detail: `正確答案：${question.answer}`,
      animated: pointerActivated,
      duration: WRONG_FEEDBACK_MS,
    }, () => {
      setSelectedAnswer("");
      setAnswerAccepted(false);
      setQuestion(drawQuestion(playable));
      setMessage("");
    }, pointerActivated ? 160 : 0);
  }

  const settings = [
    <section key="bank" className="space-y-4">
      <header>
        <h3 className="text-h3 text-ink">要用哪份題庫？</h3>
        <DialogDescription className="mt-1">
          使用共用 Excel 題庫；只會出選擇題與是非題。答對題目才能猜密碼；猜錯後依數字更新範圍並換題。
        </DialogDescription>
      </header>
      <Tabs
        value={source}
        onValueChange={(value) => setSource(value as Source)}
      >
        <TabsList aria-label="題庫來源">
          <TabsTrigger value="default">內建題庫</TabsTrigger>
          <TabsTrigger value="custom">自訂題庫</TabsTrigger>
        </TabsList>
        <TabsContent value="default">
          <QuestionPreview questions={playableOf(MORSE_QUESTIONS, "hard")} />
        </TabsContent>
        <TabsContent value="custom" className="space-y-3">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void readFile(event.dataTransfer.files[0]);
            }}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center ${dragging ? "border-ink bg-secondary" : "border-border hover:bg-muted/60"}`}
          >
            <span className="text-sm font-semibold text-ink">
              {bank.length ? "換一份 Excel" : "把 .xlsx 拖進來，或點這裡選檔"}
            </span>
            <label className="cursor-pointer text-caption text-primary underline">
              選擇檔案
              <input
                type="file"
                accept=".xlsx,.xls"
                className="sr-only"
                onChange={(event) => void readFile(event.target.files?.[0])}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-caption text-muted-foreground">
              支援選擇題與是非題。下載範本可取得欄位格式。
            </p>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              {copied ? "已複製提示詞" : "下載題庫範本"}
            </Button>
          </div>
          {errors.length > 0 && (
            <ul className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-ink">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
          {bank.length > 0 && (
            <QuestionPreview questions={playableQuestions(bank)} />
          )}
        </TabsContent>
      </Tabs>
    </section>,
    <section key="rules" className="space-y-4">
      <header>
        <h3 className="text-h3 text-ink">選擇題目難度</h3>
        <DialogDescription className="mt-1">
          只會從所選難度上限以下的題目出題。
        </DialogDescription>
      </header>
      <div className="flex flex-wrap gap-2">
        {DIFFICULTIES.map((difficulty) => (
          <label
            key={difficulty}
            className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold ${cap === difficulty ? "border-primary bg-secondary text-foreground" : "border-border bg-card text-muted-foreground"}`}
          >
            <input
              className="sr-only"
              type="radio"
              name="morse-difficulty"
              checked={cap === difficulty}
              onChange={() => setCap(difficulty)}
            />
            {DIFFICULTY_CAP_LABEL[difficulty]}
          </label>
        ))}
      </div>
      <p className="text-caption text-muted-foreground">
        目前可出 {playable.length} 題；難度標示：{DIFFICULTY_LABEL[cap]}上限。
      </p>
    </section>,
  ];

  return (
    <GamePageTemplate page="morse" settings={settings} resetGame={resetGame}>
      <section className="relative isolate mx-auto flex min-h-[min(72svh,680px)] w-full max-w-5xl flex-col items-center gap-8 text-center">
        {feedback && (
          <div
            className="morse-fb absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-paper/85 px-4"
            data-kind={feedback.kind}
            data-animated={feedback.animated || undefined}
            style={{ animationDuration: `${feedback.duration}ms` }}
          >
            <output
              aria-label={`${feedback.title}${feedback.title.endsWith("！") ? "" : "，"}${feedback.detail}`}
              className="morse-fb-card relative flex w-full max-w-xl flex-col items-center rounded-[2rem] border-4 border-(--fb) bg-card px-8 pb-9 pt-7 shadow-[0_10px_0_var(--fb)]"
            >
              <span aria-hidden="true" className="relative grid size-32 place-items-center">
                {feedback.kind === "correct" &&
                  ["bg-brand-yellow", "bg-brand-red", "bg-brand-blue", "bg-brand-green"].flatMap((color, i) => [
                    <i key={i} className={`morse-fb-ray ${color}`} style={{ "--i": i } as CSSProperties} />,
                    <i key={i + 4} className={`morse-fb-ray ${color}`} style={{ "--i": i + 4 } as CSSProperties} />,
                  ])}
                <svg viewBox="0 0 100 100" className="size-full overflow-visible" fill="none" stroke="var(--fb)" strokeWidth="14" strokeLinecap="round">
                  {feedback.kind === "correct" ? (
                    <circle className="morse-fb-stroke" cx="50" cy="50" r="38" pathLength={1} transform="rotate(-90 50 50)" />
                  ) : (
                    <>
                      <path className="morse-fb-stroke" d="M18 18 82 82" pathLength={1} />
                      <path className="morse-fb-stroke" d="M82 18 18 82" pathLength={1} />
                    </>
                  )}
                </svg>
              </span>
              <span className="mt-3 block text-[clamp(3rem,8vw,5.5rem)] font-black leading-tight text-(--fb-ink)">{feedback.title}</span>
              <span className="mt-2 block text-[clamp(1.5rem,4vw,2.75rem)] font-bold leading-snug text-foreground">{feedback.detail}</span>
            </output>
          </div>
        )}
        {answerNumber !== null ? (
          <div className="morse-win-enter relative my-auto flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-3xl border-2 border-success bg-card px-6 py-12 shadow-sm sm:py-16">
            <output className="sr-only">破解成功！正確密碼是 {answerNumber}</output>
            <div aria-hidden="true" className="morse-paper-field absolute inset-0 pointer-events-none">
              <span className="bg-brand-yellow" />
              <span className="bg-brand-red" />
              <span className="bg-brand-blue" />
              <span className="bg-brand-green" />
              <span className="bg-brand-yellow" />
              <span className="bg-brand-blue" />
            </div>
            <p className="text-h2 text-success-ink">破解成功！</p>
            <p className="mt-6 text-body-lg text-muted-foreground">正確密碼是</p>
            <p className="morse-number-enter mt-2 text-[clamp(5rem,18vw,11rem)] font-black leading-none tabular-nums text-success-ink" aria-label={`數字答案 ${answerNumber}`}>
              {answerNumber}
            </p>
            <Button className="relative mt-10 h-14 px-8 text-h3 transition-transform duration-press ease-out active:scale-[0.97]" onClick={resetGame}>
              再玩一局
            </Button>
          </div>
        ) : (
          <div className="contents" inert={feedback !== null}>
            <div className="w-full space-y-4">
              {question ? (
                <div className="rounded-3xl border-2 border-ink/10 bg-card px-8 py-7 shadow-sm">
                  <h2 className="text-hero text-foreground">{question.text}</h2>
                  {answerAccepted && (
                    <output className="morse-answer-enter mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-success-soft px-5 py-3 text-success-ink">
                      <span className="text-body-lg font-bold">✓ 答對了，來猜密碼！</span>
                      <span className="text-body-lg font-bold">正確答案：{question.answer}</span>
                    </output>
                  )}
                </div>
              ) : (
                <p className="rounded-2xl bg-warning-soft px-5 py-4 text-warning-ink">
                  目前題庫沒有符合難度的題目，請調整設定。
                </p>
              )}
              <p className="text-h2 font-semibold text-muted-foreground">
                目前密碼範圍：{range.low} 到 {range.high}
              </p>
            </div>

            <div className="flex w-full flex-1 flex-col items-center justify-end gap-6 pb-2">
              {message && (
                <p
                  aria-live="polite"
                  className="text-body-lg font-bold text-foreground"
                >
                  {message}
                </p>
              )}
              {!answerAccepted &&
                question &&
                (question.type === "choice" ? (
                  <div className="grid w-full gap-4 sm:grid-cols-2">
                    {question.options?.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant="outline"
                        disabled={!!selectedAnswer}
                        className={`min-h-24 whitespace-normal !text-hero transition-[background-color,color,opacity,transform] duration-press ease-out active:scale-[0.97] ${selectedAnswer === option ? "!border-success !bg-success-soft !text-success-ink disabled:opacity-100" : selectedAnswer ? "opacity-40" : ""}`}
                        onClick={(event) => checkQuestionAnswer(option, event.detail !== 0)}
                      >
                        {selectedAnswer === option && "✓ "}{option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="grid w-full grid-cols-2 gap-4">
                    {["是", "否"].map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant="outline"
                        disabled={!!selectedAnswer}
                        className={`min-h-24 !text-hero transition-[background-color,color,opacity,transform] duration-press ease-out active:scale-[0.97] ${selectedAnswer === option ? "!border-success !bg-success-soft !text-success-ink disabled:opacity-100" : selectedAnswer ? "opacity-40" : ""}`}
                        onClick={(event) => checkQuestionAnswer(option, event.detail !== 0)}
                      >
                        {selectedAnswer === option && "✓ "}{option}
                      </Button>
                    ))}
                  </div>
                ))}
              {answerAccepted && question && (
                <div className="morse-answer-enter w-full space-y-4">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-16 text-3xl"
                      aria-label="減少 1"
                      disabled={numberGuess <= 1}
                      onClick={() =>
                        setNumberGuess((value) => Math.max(1, value - 1))
                      }
                    >
                      −
                    </Button>
                    <TickSlider
                      value={numberGuess}
                      onChange={setNumberGuess}
                      min={1}
                      max={100}
                      step={1}
                      tickEvery={5}
                      majorEvery={20}
                      tickStart={0}
                      label="選擇數字"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-16 text-3xl"
                      aria-label="增加 1"
                      disabled={numberGuess >= 100}
                      onClick={() =>
                        setNumberGuess((value) => Math.min(100, value + 1))
                      }
                    >
                      +
                    </Button>
                  </div>
                  <div className="pt-4">
                    <Button
                      type="button"
                      size="lg"
                      className="mx-auto h-16 w-1/2 rounded-xl !text-h2"
                      onClick={(event) => submit(numberGuess, event.detail !== 0)}
                    >
                      確認密碼
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </GamePageTemplate>
  );
}
