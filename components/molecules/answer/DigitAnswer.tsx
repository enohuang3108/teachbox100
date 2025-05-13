"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef } from "react";

export interface DigitConfig {
  label: string;
  max: number; // Max value (exclusive for modulo)
  digits: number; // Number of digits to display (e.g., 2 for HH or MM)
}

export type DigitValue = Record<string, number>;

interface DigitAnswerProps {
  // value should be an object like { hour: 10, minute: 30 }
  value: DigitValue | null;
  // onChange passes the updated value object
  onChange: (value: DigitValue) => void;
  // Configuration for each segment (hour, minute, second)
  config: Record<string, DigitConfig>;
  className?: string;
}

export default function DigitAnswer({
  value,
  onChange,
  config,
  className,
}: DigitAnswerProps) {
  const digitRefs = useRef<
    Record<string, { current: HTMLSpanElement | null; staging: HTMLSpanElement | null }>
  >({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // 使用 ref 保存最新的 value，避免閉包問題
  const valueRef = useRef<DigitValue | null>(value);

  // 每次 value 變化時更新 ref
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const handleDigitChange = (key: string, increment: number) => {
    const currentSpan = digitRefs.current[key]?.current;
    const stagingSpan = digitRefs.current[key]?.staging;
    const configData = config[key];

    // 使用 valueRef 取得最新值
    const currentValue = valueRef.current || {};
    const currentVal = currentValue[key] ?? 0;
    const { max, digits } = configData || { max: 10, digits: 1 };
    const newVal = (currentVal + increment + max) % max;

    // 更新值
    const newValue = { ...currentValue, [key]: newVal };
    onChange(newValue);

    if (currentSpan && stagingSpan && configData) {
      const formattedNewVal = newVal.toString().padStart(digits, "0");

      // Prepare staging span
      stagingSpan.textContent = formattedNewVal;
      currentSpan.classList.remove("slide-out-up", "slide-out-down");
      stagingSpan.classList.remove("slide-in-up", "slide-in-down");
      // Force reflow
      void currentSpan.offsetWidth;

      const animationEndHandler = () => {
        currentSpan.textContent = formattedNewVal; // Update current span content after animation
        currentSpan.classList.remove("slide-out-up", "slide-out-down");
        stagingSpan.classList.remove("slide-in-up", "slide-in-down");
        currentSpan.style.transform = ""; // Reset transform
        stagingSpan.style.transform = ""; // Reset transform
        stagingSpan.textContent = ""; // Clear staging
        // No need to remove listener manually with { once: true }
      };
      // Use { once: true } to automatically remove the listener after it fires
      currentSpan.addEventListener("animationend", animationEndHandler, {
        once: true,
      });

      if (increment > 0) {
        // Up
        stagingSpan.style.transform = "translateY(100%)"; // Start below
        currentSpan.classList.add("slide-out-up");
        stagingSpan.classList.add("slide-in-up");
      } else {
        // Down
        stagingSpan.style.transform = "translateY(-100%)"; // Start above
        currentSpan.classList.add("slide-out-down");
        stagingSpan.classList.add("slide-in-down");
      }
    }
  };

  // Start long press timer
  const startLongPress = (key: string, increment: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    handleDigitChange(key, increment);

    let delay = 500;
    let speed = 100;
    let pressTime = 0;

    intervalRef.current = setInterval(() => {
      pressTime += speed;
      handleDigitChange(key, increment);

      if (pressTime > 300 && speed > 50) {
        clearInterval(intervalRef.current!);
        speed = 50;
        intervalRef.current = setInterval(() => {
          handleDigitChange(key, increment);
        }, speed);
      }
    }, delay);
  };

  // Stop long press timer
  const stopLongPress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format the number with leading zeros
  const formatValue = (key: string): string => {
    const numDigits = config[key].digits;
    const currentVal = value?.[key] ?? 0;
    return currentVal.toString().padStart(numDigits, "0");
  };

  // Initialize refs object with keys from config
  useEffect(() => {
    Object.keys(config).forEach((key) => {
      if (!digitRefs.current[key]) {
        digitRefs.current[key] = { current: null, staging: null };
      }
    });
  }, [config]);

  // Ref callback functions
  const setCurrentRef = (key: string) => (el: HTMLSpanElement | null) => {
    if (!digitRefs.current[key]) {
      digitRefs.current[key] = { current: el, staging: null };
    } else {
      digitRefs.current[key].current = el;
    }
  };

  const setStagingRef = (key: string) => (el: HTMLSpanElement | null) => {
    if (!digitRefs.current[key]) {
      digitRefs.current[key] = { current: null, staging: el };
    } else {
      digitRefs.current[key].staging = el;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 md:gap-6",
        className,
      )}
    >
      {Object.entries(config).map(([key, { label }]) => (
        <div key={key} className="flex flex-col items-center">
          <div className="mb-1 text-lg font-medium text-gray-600">{label}</div>
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full transition-transform hover:bg-gray-100 active:scale-95 [&_svg]:size-8"
              onMouseDown={() => startLongPress(key, 1)}
              onMouseUp={stopLongPress}
              onMouseLeave={stopLongPress}
              onTouchStart={() => startLongPress(key, 1)}
              onTouchEnd={stopLongPress}
              aria-label={`add ${label}`}
            >
              <ChevronUp />
            </Button>
            <div className="relative min-w-[3.5rem] min-h-[3.5rem] overflow-hidden rounded-md border border-gray-200 bg-white px-2 py-1 text-2xl font-bold shadow-sm md:h-14 md:min-w-[4rem] md:text-3xl">
              <span
                ref={setStagingRef(key)}
                className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out"
                aria-hidden="true"
              />
              <span
                ref={setCurrentRef(key)}
                className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out"
              >
                {formatValue(key)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full transition-transform hover:bg-gray-100 active:scale-95 [&_svg]:size-8"
              onMouseDown={() => startLongPress(key, -1)}
              onMouseUp={stopLongPress}
              onMouseLeave={stopLongPress}
              onTouchStart={() => startLongPress(key, -1)}
              onTouchEnd={stopLongPress}
              aria-label={`decrease ${label}`}
            >
              <ChevronDown />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
