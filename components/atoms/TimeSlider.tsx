"use client";

import { ClockTime } from "@/components/atoms/Clock";
import { Slider } from "@/components/atoms/shadcn/slider";
import { cn } from "@/lib/utils";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useRef, useState } from "react";

interface TimeSliderProps {
  time: ClockTime;
  onChange: (time: ClockTime) => void;
  className?: string;
  debounceTime?: number;
}

export default function TimeSlider({
  time,
  onChange,
  className,
  debounceTime = 150,
}: TimeSliderProps) {
  const totalMinutes = time.hour * 60 + time.minute;
  const [sliderValue, setSliderValue] = useState<number>(totalMinutes);
  const debouncedValue = useDebounce(sliderValue, debounceTime);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!isInternalChange.current) {
      const newTotalMinutes = time.hour * 60 + time.minute;
      if (sliderValue !== newTotalMinutes) {
        setSliderValue(newTotalMinutes);
      }
    }
    isInternalChange.current = false;
  }, [time, sliderValue]);

  // 當滑塊值變化時，僅更新內部狀態
  const handleChange = useCallback((newValue: number[]) => {
    if (!newValue.length) return;
    isInternalChange.current = true;
    setSliderValue(newValue[0]);
  }, []);

  // 當防抖值變化時，再通知父組件
  const prevDebouncedValueRef = useRef(debouncedValue);
  useEffect(() => {
    // 只有當防抖值真正變化時才觸發onChange
    if (prevDebouncedValueRef.current !== debouncedValue) {
      const hour = Math.floor(debouncedValue / 60);
      const minute = debouncedValue % 60;

      onChange({
        hour,
        minute,
        second: time.second || 0
      });

      prevDebouncedValueRef.current = debouncedValue;
    }
  }, [debouncedValue, onChange, time.second]);

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
