"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { TickSlider } from "@/components/atoms/TickSlider";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { SetupPanel } from "@/components/ultimate-password/SetupPanel";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { useSound } from "@/lib/hooks/useSound";
import {
  drawQuestion,
  resolveRoundGuess,
  startRound,
} from "@/lib/ultimate-password/game";
import { ULTIMATE_PASSWORD_QUESTIONS } from "@/lib/ultimate-password/questions";
import { useUltimatePasswordProgress, useUltimatePasswordStore } from "@/lib/ultimate-password/store";
import { useSharedSetup } from "@/lib/share/useSharedSetup";
import { playableOf } from "@/lib/territory/rules";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type AnswerFeedback = {
  kind: "correct" | "wrong";
  title: string;
  detail: string;
  animated: boolean;
  duration: number;
};

const CORRECT_FEEDBACK_MS = 1000;
const WRONG_FEEDBACK_MS = 1200;

const pageInfo: PageWithKey = { ...pages["ultimate-password"], key: "ultimate-password" };

export function UltimatePasswordGame() {
  // persist 要等 client 才有資料；SEO 區塊在 PageTemplate 裡照常 SSR，只擋遊戲本體
  const [hydrated, setHydrated] = useState(false);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    setHydrated(true);
    // 重新整理時這一局還在，直接回到遊戲，不經過介紹頁
    if (useUltimatePasswordProgress.getState().round) setEntered(true);
  }, []);
  const [setupOpen, setSetupOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const { bank, useDefault, cap, sound, setSound } = useUltimatePasswordStore();
  useSharedSetup("ultimate-password", (setup) => {
    useUltimatePasswordStore.setState({
      bank: setup.bank ?? [],
      useDefault: setup.bank === null,
      cap: setup.cap,
    });
    setSetupOpen(true);
  });

  const sfx = useSound();
  const playCorrectSound = () => sound && sfx.playCorrectSound();
  const playWrongSound = () => sound && sfx.playWrongSound();
  const { question, round, answerAccepted, numberGuess, answerNumber } =
    useUltimatePasswordProgress();
  const patch = useUltimatePasswordProgress.setState;
  const setNumberGuess = (numberGuess: number) => patch({ numberGuess });
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const answerTransitionTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(
    () => () => {
      if (answerTransitionTimer.current)
        clearTimeout(answerTransitionTimer.current);
    },
    [],
  );

  const range = round?.range ?? { low: 1, high: 100 };
  const playable = useMemo(
    () => playableOf(useDefault ? ULTIMATE_PASSWORD_QUESTIONS : bank, cap),
    [useDefault, bank, cap],
  );

  const resetGame = useCallback(() => {
    if (answerTransitionTimer.current)
      clearTimeout(answerTransitionTimer.current);
    answerTransitionTimer.current = null;
    setFeedback(null);
    patch({
      question: drawQuestion(playable),
      round: startRound(),
      answerAccepted: false,
      numberGuess: 50,
      answerNumber: null,
    });
    setSelectedAnswer("");
    setMessage("");
  }, [patch, playable]);

  function showFeedback(nextFeedback: AnswerFeedback, onFinish: () => void) {
    setFeedback(nextFeedback);
    answerTransitionTimer.current = setTimeout(() => {
      onFinish();
      setFeedback(null);
      answerTransitionTimer.current = null;
    }, nextFeedback.duration);
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
      patch({ answerNumber: round.secret });
      setMessage("");
      return;
    }
    playWrongSound();
    const next = result.round.range;
    showFeedback(
      {
        kind: "wrong",
        title: "沒猜中",
        detail: `密碼在 ${next.low} 到 ${next.high} 之間`,
        animated: pointerActivated,
        duration: WRONG_FEEDBACK_MS,
      },
      () => {
        patch({
          round: result.round,
          answerAccepted: false,
          question: drawQuestion(playable),
        });
        setSelectedAnswer("");
        setMessage("");
      },
    );
  }

  function checkQuestionAnswer(value: string, pointerActivated: boolean) {
    if (!question || selectedAnswer) return;
    setSelectedAnswer(value);
    if (value === question.answer) {
      playCorrectSound();
      setMessage("");
      showFeedback(
        {
          kind: "correct",
          title: "答對了！",
          detail: `正確答案：${question.answer}`,
          animated: pointerActivated,
          duration: CORRECT_FEEDBACK_MS,
        },
        () => patch({ answerAccepted: true }),
      );
      return;
    }
    playWrongSound();
    showFeedback(
      {
        kind: "wrong",
        title: "答錯了",
        detail: `正確答案：${question.answer}`,
        animated: pointerActivated,
        duration: WRONG_FEEDBACK_MS,
      },
      () => {
        setSelectedAnswer("");
        patch({ question: drawQuestion(playable) });
        setMessage("");
      },
    );
  }

  const begin = () => {
    resetGame();
    setSetupOpen(false);
    setEntered(true);
  };
  const openSettings = () => {
    // 範圍縮過又還沒猜中時，回設定會丟掉這一局
    const narrowed = range.low !== 1 || range.high !== 100;
    if (narrowed && answerNumber === null) setConfirmLeave(true);
    else setSetupOpen(true);
  };

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="重新出題">
        <RefreshCWIcon
          className={ACTION_BTN}
          size={20}
          aria-label="重新出題"
          onClick={resetGame}
        />
      </Tip>
      <SettingsButton onClick={openSettings} />
      <SoundToggleButton on={sound} onToggle={setSound} />
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <>
      <PageTemplate
        page={pageInfo}
        actions={actions}
        landing={{
          startLabel: "開始使用",
          onStart: () => setSetupOpen(true),
          entered,
        }}
      >
        {hydrated && (
          <section className="relative isolate mx-auto flex min-h-[min(72svh,680px)] w-full max-w-5xl flex-col items-center gap-8 text-center">
            {feedback && (
              <div
                className="password-fb absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-paper/85 px-4"
                data-kind={feedback.kind}
                data-animated={feedback.animated || undefined}
                style={{ animationDuration: `${feedback.duration}ms` }}
              >
                <output
                  aria-label={`${feedback.title}${feedback.title.endsWith("！") ? "" : "，"}${feedback.detail}`}
                  className="password-fb-card relative flex w-full max-w-xl flex-col items-center rounded-[2rem] border-4 border-(--fb) bg-card px-8 pb-9 pt-7 shadow-[0_10px_0_var(--fb)]"
                >
                  <span
                    aria-hidden="true"
                    className="relative grid size-32 place-items-center"
                  >
                    {feedback.kind === "correct" &&
                      [
                        "bg-brand-yellow",
                        "bg-brand-red",
                        "bg-brand-blue",
                        "bg-brand-green",
                      ].flatMap((color, i) => [
                        <i
                          key={i}
                          className={`password-fb-ray ${color}`}
                          style={{ "--i": i } as CSSProperties}
                        />,
                        <i
                          key={i + 4}
                          className={`password-fb-ray ${color}`}
                          style={{ "--i": i + 4 } as CSSProperties}
                        />,
                      ])}
                    <svg
                      viewBox="0 0 100 100"
                      className="size-full overflow-visible"
                      fill="none"
                      stroke="var(--fb)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    >
                      {feedback.kind === "correct" ? (
                        <circle
                          className="password-fb-stroke"
                          cx="50"
                          cy="50"
                          r="38"
                          pathLength={1}
                          transform="rotate(-90 50 50)"
                        />
                      ) : (
                        <>
                          <path
                            className="password-fb-stroke"
                            d="M18 18 82 82"
                            pathLength={1}
                          />
                          <path
                            className="password-fb-stroke"
                            d="M82 18 18 82"
                            pathLength={1}
                          />
                        </>
                      )}
                    </svg>
                  </span>
                  <span className="mt-3 block text-[clamp(3rem,8vw,5.5rem)] font-black leading-tight text-(--fb-ink)">
                    {feedback.title}
                  </span>
                  <span className="mt-2 block text-[clamp(1.5rem,4vw,2.75rem)] font-bold leading-snug text-foreground">
                    {feedback.detail}
                  </span>
                </output>
              </div>
            )}
            {answerNumber !== null ? (
              <div className="password-win-enter relative my-auto flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-3xl border-2 border-success bg-card px-6 py-12 shadow-sm sm:py-16">
                <output className="sr-only">
                  破解成功！正確密碼是 {answerNumber}
                </output>
                <div
                  aria-hidden="true"
                  className="password-paper-field absolute inset-0 pointer-events-none"
                >
                  <span className="bg-brand-yellow" />
                  <span className="bg-brand-red" />
                  <span className="bg-brand-blue" />
                  <span className="bg-brand-green" />
                  <span className="bg-brand-yellow" />
                  <span className="bg-brand-blue" />
                </div>
                <p className="text-h2 text-success-ink">破解成功！</p>
                <p className="mt-6 text-body-lg text-muted-foreground">
                  正確密碼是
                </p>
                <p
                  className="password-number-enter mt-2 text-[clamp(5rem,18vw,11rem)] font-black leading-none tabular-nums text-success-ink"
                  aria-label={`數字答案 ${answerNumber}`}
                >
                  {answerNumber}
                </p>
                <Button
                  className="relative mt-10 h-14 px-8 text-h3 transition-transform duration-press ease-out active:scale-[0.97]"
                  onClick={resetGame}
                >
                  再玩一局
                </Button>
              </div>
            ) : (
              <div className="contents" inert={feedback !== null}>
                <div className="w-full space-y-4">
                  {question ? (
                    <div className="rounded-3xl border-2 border-ink/10 bg-card px-8 py-7 shadow-sm">
                      <h2 className="text-hero text-foreground">
                        {question.text}
                      </h2>
                      {answerAccepted && (
                        <output className="password-answer-enter mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-success-soft px-5 py-3 text-success-ink">
                          <span className="text-body-lg font-bold">
                            ✓ 答對了，來猜密碼！
                          </span>
                          <span className="text-body-lg font-bold">
                            正確答案：{question.answer}
                          </span>
                        </output>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-warning-soft px-5 py-4 text-warning-ink">
                      目前題庫沒有符合難度的題目，請調整設定。
                    </p>
                  )}
                  <p className="text-h2 font-semibold tabular-nums text-foreground">
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
                  {!answerAccepted && question && (
                    <div
                      className={`grid w-full grid-cols-2 gap-4 ${question.type === "choice" ? "max-sm:grid-cols-1" : ""}`}
                    >
                      {(question.type === "choice"
                        ? (question.options ?? [])
                        : ["是", "否"]
                      ).map((option) => (
                        // 按下後不改色不改字：結果交給中央的回饋卡講，按鈕只擋住重按
                        <Button
                          key={option}
                          type="button"
                          variant="outline"
                          disabled={!!selectedAnswer}
                          className="min-h-24 whitespace-normal !text-hero transition-transform duration-press ease-out active:scale-[0.97] disabled:opacity-100"
                          onClick={(event) =>
                            checkQuestionAnswer(option, event.detail !== 0)
                          }
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                  {answerAccepted && question && (
                    <div className="password-answer-enter w-full space-y-4">
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-16 text-3xl transition-transform duration-press ease-out active:scale-[0.97]"
                          aria-label="減少 1"
                          disabled={numberGuess <= 1}
                          onClick={() =>
                            patch((s) => ({ numberGuess: Math.max(1, s.numberGuess - 1) }))
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
                          className="size-16 text-3xl transition-transform duration-press ease-out active:scale-[0.97]"
                          aria-label="增加 1"
                          disabled={numberGuess >= 100}
                          onClick={() =>
                            patch((s) => ({ numberGuess: Math.min(100, s.numberGuess + 1) }))
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
                          onClick={(event) =>
                            submit(numberGuess, event.detail !== 0)
                          }
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
        )}
      </PageTemplate>

      {/* 放在 PageTemplate 外面：介紹頁階段 children 不渲染，設定要在那時就能開 */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <SetupPanel onStart={begin} />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>離開這一局？</DialogTitle>
            <DialogDescription>
              密碼範圍會清掉，回到設定後要重新開始。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmLeave(false)}>
              繼續玩
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmLeave(false);
                setSetupOpen(true);
              }}
            >
              回到設定
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
