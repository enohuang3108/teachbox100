"use client";

import Clock, { type ClockTime } from "@/components/atoms/Clock";
import { useStoredState } from "@/lib/hooks/useStoredState";
import { TickSlider } from "@/components/atoms/TickSlider";
import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Label } from "@/components/atoms/shadcn/label";
import { Switch } from "@/components/atoms/shadcn/switch";
import type { SetupStep } from "@/components/organisms/StepSetup";
import { Clock3, MousePointerClick } from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import KeypadAnswer from "@/components/molecules/answer/KeypadAnswer";
import { AnswerMethod } from "@/components/molecules/setting/AnswerMethod";
import DigitAnswer, {
  DigitConfig,
  DigitValue,
} from "@/components/molecules/answer/DigitAnswer";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { StageFixed } from "@/components/templates/StageFixed";
import {
  FeedbackOverlay,
  type AnswerFeedback,
} from "@/components/ultimate-password/FeedbackOverlay";
import {
  clockChoices,
  clockText,
  isClockAnswerCorrect,
  parseKeypadTime,
  randomClockTime,
  type ClockPeriod,
} from "@/lib/clock/game";
import { ANSWER_CONTENT, ANSWER_GRID, answerTextClass, SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/hooks/useSound";
import { useDebounce } from "@uidotdev/usehooks";
import { useSharedSetup } from "@/lib/share/useSharedSetup";
import type { ClockAnswerMethod } from "@/lib/clock/share";
import { useEffect, useMemo, useRef, useState } from "react";

// 與終極密碼同節奏：答錯停得比答對久一點，讓全班看清楚
const CORRECT_FEEDBACK_MS = 1000;
const WRONG_FEEDBACK_MS = 1200;

const PERIODS: Record<ClockPeriod, string> = {
  am: "上午",
  pm: "下午",
  random: "隨機上下午",
};

// answer uses 24-hour format
const defaultAnswer: ClockTime = {
  hour: 0, // 12 AM in 24-hour format
  minute: 0,
  second: 0,
};

export default function CurrentTimePage() {
  const [answer, setAnswer] = useState<ClockTime>(defaultAnswer);
  const [selectedAnswer, setSelectedAnswer] = useState<ClockTime>(defaultAnswer);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playCorrectSound, playWrongSound } = useSound();
  // 舊版只有「隨機上下午（24 小時制）」開關存在 clockIs24Hour；還沒選過範圍的老師沿用它
  const [legacy24Hour] = useStoredState("clockIs24Hour", false);
  const [storedPeriod, setPeriod] = useStoredState<ClockPeriod | null>("clockPeriod", null);
  const period: ClockPeriod = storedPeriod ?? (legacy24Hour ? "random" : "am");
  // 只出上午或下午時，鐘面標好了上下午，孩子讀 1–12 點就算對
  const is24HourClock = period === "random";
  const [showMinuteHint, setShowMinuteHint] = useStoredState("clockShowMinuteHint", true);
  const [answerMethod, setAnswerMethod] = useStoredState<ClockAnswerMethod>("clockAnswerMethod", "multiple");
  const [keypadValue, setKeypadValue] = useState("");
  const [setupOpen, setSetupOpen] = useState(false);
  const stacked = answerMethod === "multiple";
  useSharedSetup("clock-current-time", (setup) => {
    setPeriod(setup.period);
    setShowMinuteHint(setup.showMinuteHint);
    setAnswerMethod(setup.answerMethod);
    setSetupOpen(true);
  });

  // 老師拖滑桿改題目時，鐘面即時跟著動；選項等停手 400ms 才換，拖動中不閃
  const settled = useDebounce(answer, 400);
  const choices = useMemo(
    () => clockChoices(settled, is24HourClock),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settled.hour, settled.minute, is24HourClock],
  );

  const submitted: ClockTime | null =
    answerMethod === "keypad"
      ? parseKeypadTime(keypadValue)
      : answerMethod === "multiple"
        ? null // 選擇題按下去就是作答，不經過「確定」
        : selectedAnswer;

  useEffect(() => {
    resetTime();
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAnswer = () => {
    setSelectedAnswer(defaultAnswer);
    setKeypadValue("");
  };

  const resetTime = () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = null;
    setFeedback(null);
    setAnswer(randomClockTime(period));
    clearAnswer();
  };

  // 答對換下一題；答錯不揭曉，清掉作答讓孩子再看一次同一個鐘面
  const checkAnswer = (pointerActivated: boolean, picked = submitted) => {
    if (!picked || feedback) return;
    const correct = isClockAnswerCorrect(answer, picked, is24HourClock);
    if (correct) playCorrectSound();
    else playWrongSound();
    const next: AnswerFeedback = correct
      ? {
          kind: "correct",
          title: "答對了！",
          detail: `現在是 ${clockText(answer, true)}`,
          animated: pointerActivated,
          duration: CORRECT_FEEDBACK_MS,
        }
      : {
          kind: "wrong",
          title: "再看一次",
          detail: "短針看時、長針看分",
          animated: pointerActivated,
          duration: WRONG_FEEDBACK_MS,
        };
    setFeedback(next);
    feedbackTimer.current = setTimeout(() => {
      feedbackTimer.current = null;
      if (correct) resetTime();
      else {
        setFeedback(null);
        clearAnswer();
      }
    }, next.duration);
  };

  const digitConfig: Record<string, DigitConfig> = useMemo(
    () => ({
      hour: { label: "時", max: is24HourClock ? 24 : 12, min: 0, digits: 2 }, // For 1-12 hour input
      minute: { label: "分", max: 60, min: 0, digits: 2 },
    }),
    [is24HourClock],
  );

  const handleDigitChange = (newValue: DigitValue) => {
    const newHour = newValue["hour"]; // This will be 1-12 from DigitAnswer
    const newMinute = newValue["minute"];

    if (typeof newHour === "number" && typeof newMinute === "number") {
      setSelectedAnswer((prev) => ({
        ...prev,
        hour: newHour,
        minute: newMinute,
      }));
    }
  };

  const ANSWER_METHODS: Record<ClockAnswerMethod, string> = {
    digit: "數字調整",
    multiple: "選擇題",
    keypad: "鍵盤輸入",
  };

  const steps: SetupStep[] = [
    {
      key: "question",
      label: "題目",
      icon: Clock3,
      summary: `${PERIODS[period]}・${showMinuteHint ? "顯示" : "不顯示"}分鐘提示`,
      content: (
        <section className="space-y-5">
          <header>
            <h3 className="text-h3 text-ink">出什麼時間？</h3>
            <DialogDescription className="mt-1">練習中按右上角的設定也能再改。</DialogDescription>
          </header>
          <div className="space-y-2">
            <h4 className="mb-2 text-sm font-medium text-foreground">題目範圍</h4>
            <RadioGroup
              value={period}
              onValueChange={(v) => setPeriod(v as ClockPeriod)}
              className="space-y-2"
            >
              {Object.entries(PERIODS).map(([value, label]) => (
                <label key={value} className="group" htmlFor={`period-${value}`}>
                  <div
                    className={cn(
                      "flex w-full cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors",
                      SELECTED_OPTION,
                    )}
                  >
                    <RadioGroupItem value={value} id={`period-${value}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="minute-hint" checked={showMinuteHint} onCheckedChange={setShowMinuteHint} />
            <Label htmlFor="minute-hint">顯示分鐘提示（錶框外的 0、5、10…）</Label>
          </div>
        </section>
      ),
    },
    {
      key: "answer",
      label: "回答",
      icon: MousePointerClick,
      summary: ANSWER_METHODS[answerMethod] ?? "",
      content: (
        <section className="space-y-5">
          <header>
            <h3 className="text-h3 text-ink">學生怎麼回答？</h3>
            <DialogDescription className="mt-1">選擇題最快，適合剛學看時鐘的孩子。</DialogDescription>
          </header>
          <AnswerMethod
            answerMethod={answerMethod}
            setAnswerMethod={(m) => setAnswerMethod(m as ClockAnswerMethod)}
          />
        </section>
      ),
    },
  ];

  return (
    <GamePageTemplate
      page="clock-current-time"
      resetGame={resetTime}
      tips={<div>
        <p>
          時：看短針，選小的（但 12、1 中間要選 12）
        </p>
        <p>分：看長針，5 個一數</p>
      </div>}
      settings={[]}
      steps={steps}
      share={{ unit: "clock-current-time", setup: { period, showMinuteHint, answerMethod } }}
      setupOpen={setupOpen}
      onSetupOpenChange={setSetupOpen}
    >
      {/* 手機上右下角的滑桿與換一題會壓住作答區，底部留白讓作答區捲得出來 */}
      <div className="pb-80 md:pb-0">
      {/* 選擇題：鐘面置中、選項接在正下方，學生走上前按得到；數字調整與鍵盤比較高，桌機改左右擺 */}
      <div
        className={cn(
          "relative isolate mx-auto flex flex-col items-center",
          stacked ? "max-w-3xl" : "max-w-5xl md:flex-row md:justify-center md:gap-12",
        )}
      >
        {/* 這一欄是鐘面加作答區疊起來的長條，手機上回饋卡改貼在螢幕正中間 */}
        {feedback && (
          <div className="fixed inset-0 z-10 md:absolute">
            <FeedbackOverlay feedback={feedback} />
          </div>
        )}
        {/* 鐘面內部用 px 排版，整個 zoom 放大；全螢幕投影再大一級。調時間只走右下角的滑桿 */}
        <div className="md:[zoom:1.25] [#game-stage:fullscreen_&]:[zoom:1.6]">
          <Clock
            time={answer}
            draggable={false}
            showAmPm={true}
            showMinuteNumbers={showMinuteHint}
            className="mb-10"
          />
        </div>

        {/* 右下角直排：時間滑桿在上、換一題在下，老師站在白板前伸手就按得到 */}
        <StageFixed>
          <div className="fixed right-6 bottom-6 z-(--z-sticky) flex flex-col items-center gap-3">
              <div className="rounded-full border border-border bg-card/95 px-2 py-4 shadow-sm">
                <TickSlider
                  value={answer.hour * 60 + answer.minute}
                  onChange={(total) =>
                    setAnswer((prev) => ({ ...prev, hour: Math.floor(total / 60), minute: total % 60 }))
                  }
                  min={0}
                  max={1439}
                  step={1}
                  tickEvery={60}
                  majorEvery={360}
                  orientation="vertical"
                  label="調整時間"
                  className="h-80"
                />
              </div>
            <Button
              onClick={resetTime}
              className="size-24 rounded-full p-0 text-xl font-bold transition-transform duration-press ease-out active:scale-[0.97]"
            >
              換一題
            </Button>
          </div>
        </StageFixed>

        <div
          inert={feedback !== null}
          className={cn("w-full", stacked ? "max-w-3xl" : "max-w-sm md:shrink-0")}
        >
          <h2
            className={cn(
              "mt-8 mb-6 text-center text-3xl font-bold md:text-4xl",
              stacked ? "md:mt-12" : "md:mt-0",
            )}
          >
            請問現在的時間是？
          </h2>
          <div className="flex flex-col gap-4">
            {answerMethod === "keypad" ? (
              <KeypadAnswer
                value={keypadValue}
                onChange={(v) => setKeypadValue(v.slice(0, 4))}
                placeholder="9 點 30 分就按 9 3 0"
                display={(v) => (v.length < 3 ? v : `${v.slice(0, -2)}:${v.slice(-2)}`)}
              />
            ) : answerMethod === "multiple" ? (
              // 同九九乘法的大卡片；結果交給中央回饋卡講，按鈕不變色
              <div className={cn(ANSWER_GRID, "grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4")}>
                {choices.map((choice) => (
                  <button
                    key={`${choice.hour}:${choice.minute}`}
                    type="button"
                    onClick={(event) => checkAnswer(event.detail !== 0, choice)}
                    className={cn(ANSWER_CONTENT, answerTextClass(clockText(choice, false)), "font-display min-h-24 rounded-2xl border-2 border-ink/10 bg-card px-3 py-6 text-ink tabular-nums transition-[border-color,transform] duration-press ease-out hover:border-ink/25 active:scale-[0.97] sm:py-8")}
                  >
                    {/* 上下午放上面一行小字；時間在窄選項裡可平衡換行 */}
                    {is24HourClock && (
                      <span className="block text-body font-bold text-muted-foreground">
                        {choice.hour < 12 ? "上午" : "下午"}
                      </span>
                    )}
                    <span className="block text-balance">{clockText(choice, false)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <DigitAnswer
                value={{
                  hour: selectedAnswer.hour, // Pass 12h format hour to DigitAnswer
                  minute: selectedAnswer.minute,
                }}
                onChange={handleDigitChange}
                config={digitConfig}
              />
            )}
          </div>
          {answerMethod !== "multiple" && (
          <Button
            onClick={(event) => checkAnswer(event.detail !== 0)}
            className="mt-6 w-full rounded-full bg-ink py-5 text-xl text-paper hover:bg-ink-soft md:mt-8 md:py-6 md:text-2xl"
            disabled={!submitted}
          >
            確定
          </Button>
          )}
        </div>
      </div>
      </div>
    </GamePageTemplate>
  );
}
