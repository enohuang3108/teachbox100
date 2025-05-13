"use client";

import { pages } from "@/app/pages.config";
import Clock, { type ClockTime } from "@/components/atoms/Clock";
import TimeSlider from "@/components/atoms/TimeSlider";
import { Label } from "@/components/atoms/shadcn/label";
import { Switch } from "@/components/atoms/shadcn/switch";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import DigitAnswer, {
  DigitConfig,
  DigitValue,
} from "@/components/molecules/answer/DigitAnswer";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { getRandomFeedback } from "@/lib/utils/gameFeedback";
import { useEffect, useMemo, useState } from "react";

const getRandomTime = (is24HourClock: boolean): ClockTime => {
  const randomHour24 = Math.floor(Math.random() * (is24HourClock ? 24 : 12));
  const randomMinute = Math.floor(Math.random() * 60);
  const randomSecond = Math.floor(Math.random() * 60);
  return {
    hour: randomHour24,
    minute: randomMinute,
    second: randomSecond,
  };
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
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [is24HourClock, setIs24HourClock] = useState<boolean>(false);
  const [showMinuteSlider, setShowMinuteSlider] = useState<boolean>(true);

  useEffect(() => {
    resetTime();
  }, []);

  const resetTime = () => {
    const newAnswer = getRandomTime(is24HourClock);
    setAnswer(newAnswer);
    setSelectedAnswer(defaultAnswer);
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    if (!selectedAnswer || !answer) return;

    const correct =
      selectedAnswer.hour === answer.hour &&
      selectedAnswer.minute === answer.minute;
    setIsCorrect(correct);
  };

  const digitConfig: Record<string, DigitConfig> = useMemo(
    () => ({
      hour: { label: "時", max: is24HourClock ? 24 : 12, min: 0, digits: 2 }, // For 1-12 hour input
      minute: { label: "分", max: 60, min: 0, digits: 2 },
    }),
    [is24HourClock],
  );

  // Converts ClockTime (24h) to display string (12h AM/PM)
  const timeToText = (date: ClockTime): string => {
    const hour24 = date.hour; // 0-23
    const minutes = date.minute;

    const isAMDisplay = hour24 < 12 || hour24 === 0; // 0-11 is AM
    let displayHour12 = hour24 % 12;
    if (displayHour12 === 0) displayHour12 = 12; // 0 and 12 should be displayed as 12

    let timeText = `${isAMDisplay ? "上午" : "下午"} ${displayHour12} 點`;
    if (minutes > 0) {
      timeText += ` ${minutes} 分`;
    }
    return timeText;
  };

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

  const handleTimeSliderChange = (newTime: ClockTime) => {
    setAnswer(newTime);
  };

  const clockSettings = (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="display-am-pm-clock"
          checked={is24HourClock}
          onCheckedChange={setIs24HourClock}
        />
        <Label htmlFor="display-am-pm-clock"> 隨機題目 24 小時制</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="display-minute-slider"
          checked={showMinuteSlider}
          onCheckedChange={setShowMinuteSlider}
        />
        <Label htmlFor="display-minute-slider">顯示調整時間拉桿</Label>
      </div>
    </div>
  );

  const handleClockChange = (newTime: ClockTime) => {
    // console.log("handleClockChange", newTime);
    setAnswer(newTime)
  };

  return (
    <GamePageTemplate
      title={pages["clock-current-time"].title}
      resetGame={resetTime}
      settings={clockSettings} // Pass the settings UI
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div className="flex flex-col items-center">
          <Clock
            time={answer} // answer.hour is 0-23
            draggable={true}
            onChange={handleClockChange}
            showAmPm={true} // Controlled by the new setting
            className="h-72 w-72 md:mb-2 md:h-80 md:w-80"
          />

          {showMinuteSlider && (
            <TimeSlider
              time={answer}
              onChange={handleTimeSliderChange}
              className="mt-4 w-full max-w-[300px]"
            />
          )}
        </div>

        <GameAnswerSection
          question={"請問時鐘的時間是？"}
          hasAnswer={selectedAnswer !== null} // Check selectedTime
          isCorrect={isCorrect}
          correctFeedback={getRandomFeedback(
            "clockgameCorrect",
            timeToText(answer), // answer is ClockTime (24h)
          )}
          incorrectFeedback={getRandomFeedback(
            "clockgameIncorrect",
            timeToText(answer), // answer is ClockTime (24h)
          )}
          showFeedback={isCorrect !== null}
          checkAnswer={checkAnswer}
          handleNextQuestion={resetTime}
          className="mt-0"
        >
          <div className="flex flex-col gap-4">
            <DigitAnswer
              value={{
                hour: selectedAnswer.hour, // Pass 12h format hour to DigitAnswer
                minute: selectedAnswer.minute,
              }}
              onChange={handleDigitChange}
              config={digitConfig}
            />
          </div>
        </GameAnswerSection>
      </div>
    </GamePageTemplate>
  );
}
