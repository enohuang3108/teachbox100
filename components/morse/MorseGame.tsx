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
import { useCallback, useMemo, useState } from "react";

type Source = "default" | "custom";

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
    setQuestion(drawQuestion(playable));
    setSelectedAnswer("");
    setAnswerAccepted(false);
    setNumberGuess(50);
    setRound(startRound());
    setAnswerNumber(null);
    setMessage("");
  }, [drawQuestion, playable]);

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

  function submit(value: number) {
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
    setRound(result.round);
    setSelectedAnswer("");
    setAnswerAccepted(false);
    setQuestion(drawQuestion(playable));
    setMessage(`答錯了，數字在 ${next.low} 到 ${next.high} 之間。已換下一題。`);
  }

  function checkQuestionAnswer(value: string) {
    if (!question) return;
    setSelectedAnswer(value);
    if (value === question.answer) {
      playCorrectSound();
      setAnswerAccepted(true);
      setMessage("");
      return;
    }
    playWrongSound();
    setSelectedAnswer("");
    setAnswerAccepted(false);
    setQuestion(drawQuestion(playable));
    setMessage(
      `答錯了，數字在 ${range.low} 到 ${range.high} 之間。已換下一題。`,
    );
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
      <section className="mx-auto flex min-h-[min(72svh,680px)] w-full max-w-5xl flex-col items-center gap-8 text-center">
        <div className="w-full space-y-4">
          {question ? (
            <div className="rounded-3xl border-2 border-ink/10 bg-card px-8 py-7 shadow-sm">
              <h2 className="text-hero text-foreground">{question.text}</h2>
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
          {answerNumber !== null && (
            <p
              className="text-display text-primary"
              aria-label={`數字答案 ${answerNumber}`}
            >
              {answerNumber}
            </p>
          )}
          {!answerAccepted &&
            answerNumber === null &&
            question &&
            (question.type === "choice" ? (
              <div className="grid w-full gap-4 sm:grid-cols-2">
                {question.options?.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className="min-h-24 whitespace-normal !text-hero"
                    onClick={() => checkQuestionAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="grid w-full grid-cols-2 gap-4">
                {["是", "否"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className="min-h-24 !text-hero"
                    onClick={() => checkQuestionAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ))}
          {answerAccepted && answerNumber === null && question && (
            <div className="w-full space-y-4">
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
                  onClick={() => submit(numberGuess)}
                >
                  確認密碼
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </GamePageTemplate>
  );
}
