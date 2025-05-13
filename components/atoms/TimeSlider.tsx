"use client";

import { ClockTime } from "@/components/atoms/Clock";
import { Slider } from "@/components/atoms/shadcn/slider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TimeSliderProps {
  time: ClockTime;
  onChange: (time: ClockTime) => void;
  className?: string;
}

export default function TimeSlider({
  time,
  onChange,
  className,
}: TimeSliderProps) {
  const totalMinutes = time.hour * 60 + time.minute;
  const [sliderValue, setSliderValue] = useState<number>(totalMinutes);

  useEffect(() => {
    setSliderValue(time.hour * 60 + time.minute);
  }, [time]);

  const handleChange = (newValue: number[]) => {
    if (!newValue.length) return;
    const totalMinutes = newValue[0];
    setSliderValue(totalMinutes);

    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    onChange({
      hour,
      minute,
      second: time.second || 0
    });
  };

  return (
    <div className={cn("w-full", className)}>
      <Slider
        defaultValue={[sliderValue]}
        min={0}
        max={1439} // 23小時59分 = 23*60 + 59 = 1439
        step={1}
        value={[sliderValue]}
        onValueChange={handleChange}
        className="my-4"
      />
    </div>
  );
}
