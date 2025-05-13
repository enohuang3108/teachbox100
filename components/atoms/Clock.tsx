"use client";

import { cn } from "@/lib/utils";
import { FC, useCallback, useRef } from "react";

type Precision = "minute" | "second";

export interface ClockTime {
  hour: number;
  minute: number;
  second: number;
}

type TimeStrategy = {
  unitDegrees: number; // 每單位的角度
  getTime: (time: ClockTime) => number; // 獲取對應單位的時間
  setTime: (time: ClockTime, value: number) => ClockTime; // 設置對應單位的時間，回傳新物件
};

const createTimeStrategy = (
  unitDegrees: number,
  getTimeFn: (time: ClockTime) => number,
  setTimeFn: (time: ClockTime, value: number) => ClockTime,
): TimeStrategy => ({
  unitDegrees,
  getTime: getTimeFn,
  setTime: setTimeFn,
});

const timeStrategies: Record<Precision, TimeStrategy> = {
  minute: createTimeStrategy(
    6, // 每分鐘6度
    (time: ClockTime) => time.minute,
    (time: ClockTime, value: number): ClockTime => ({
      ...time,
      minute: value,
    }),
  ),
  second: createTimeStrategy(
    6, // 每秒6度
    (time: ClockTime) => time.second ?? 0,
    (time: ClockTime, value: number): ClockTime => ({
      ...time,
      second: value,
    }),
  ),
};

// 通用的角度轉時間函數
const angleToTimeValue = (angle: number): number => {
  // 將角度標準化為0-360，考慮12點鐘方向為0度的偏移
  return Math.floor(((angle + 90) % 360) / 6);
};

interface ClockProps {
  time: ClockTime; // hour is 0-23
  precision?: Precision;
  onChange?: (time: ClockTime) => void;
  className?: string;
  draggable?: boolean;
  showAmPm?: boolean; // Controls AM/PM display on clock face
}

const Clock: FC<ClockProps> = ({
  time,
  precision = "minute",
  onChange,
  className,
  draggable = true,
  showAmPm = false,
}) => {
  const clockRef = useRef<HTMLDivElement>(null);
  const currentClockWidth = clockRef.current?.clientWidth ?? undefined;
  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef<ClockTime | null>(null);

  const currentStrategy = timeStrategies[precision];

  const calculateAngle = useCallback((e: MouseEvent | TouchEvent): number => {
    if (!clockRef.current) return 0;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX, clientY;
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const x = clientX - centerX;
    const y = clientY - centerY;

    // 計算角度 (以12點鐘方向為0度)
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    // 將角度轉換為0-360
    angle = (angle + 360) % 360;

    return angle;
  }, []);

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!draggable || !onChange) return;

      e.preventDefault();
      dragStartTimeRef.current = time;
      isDraggingRef.current = true;

      const updateTimeFromDrag = (event: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current || !dragStartTimeRef.current) return;

        const angle = calculateAngle(event);
        const timeValue = angleToTimeValue(angle);

        let intermediateTime = currentStrategy.setTime(
          { ...dragStartTimeRef.current },
          timeValue,
        );

        if (precision === "minute") {
          const previousMinutes = dragStartTimeRef.current.minute;
          const newMinutes = intermediateTime.minute;
          let currentHours = dragStartTimeRef.current.hour;

          if (previousMinutes >= 50 && newMinutes <= 9) {
            currentHours = (currentHours + 1) % 24;
          } else if (previousMinutes <= 9 && newMinutes >= 50) {
            currentHours = (currentHours - 1 + 24) % 24;
          }
          intermediateTime = { ...intermediateTime, hour: currentHours };
        }
        dragStartTimeRef.current = intermediateTime;
        onChange({ ...intermediateTime });
      };

      const handleMove = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        updateTimeFromDrag(event);
      };

      const handleEnd = () => {
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove);
      document.addEventListener("touchend", handleEnd);
    },
    [calculateAngle, currentStrategy, draggable, onChange, precision],
  );

  const displayHour12 = time.hour === 0 || time.hour === 12 ? 12 : time.hour % 12;
  const minutes = time.minute;
  const seconds = time.second ?? 0;
  const isAM = time.hour < 12;

  const hourDegrees = displayHour12 * 30 + minutes * 0.5;
  const minuteDegrees = minutes * 6;
  const secondDegrees = seconds * 6;

  const renderClockNumbers = () => {
    if (!currentClockWidth) return;

    return Array.from({ length: 12 }).map((_, i) => {
      const num = i + 1; // 1-12 的數字
      const deg = i * 30 + 30; // 每個數字間隔30度
      const distance = currentClockWidth / 2 - 22; // Position numbers inwards
      return (
        <div
          key={i}
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            num % 3 === 0 ? "text-lg font-extrabold" : "text-base font-medium",
          )}
          style={{
            transform: `rotate(${deg}deg) translate(0, -${distance}px) rotate(-${deg}deg)`,
          }}
        >
          {num}
        </div>
      );
    });
  };

  const renderClockTicks = () => {
    if (!currentClockWidth) return;

    return Array.from({ length: 60 }).map((_, i) => {
      if (i % 5 === 0) return null; // Use null for no-render for clarity
      const deg = i * 6;
      const distance = currentClockWidth / 2; // Position tick marks slightly inwards from the edge

      return (
        <div
          key={i}
          className={"absolute left-1/2 top-1/2 h-6 w-[1px] -translate-x-1/2 -translate-y-1/2 bg-gray-500"}
          style={{
            transform: `rotate(${deg}deg) translate(0, -${distance}px)`,
          }}
        />
      );
    });
  };

  const renderClockHands = () => {
    return (
      <>
        {/* 時針 */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 origin-bottom rounded-full bg-black shadow-md w-[4px] h-[28%] -translate-x-1/2 -translate-y-full",
            !isDraggingRef.current && "transition-transform duration-300 ease-in-out",
          )}
          style={{
            transform: `rotate(${hourDegrees}deg)`,
          }}
        />

        {/* 分針 */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 origin-bottom rounded-full bg-black shadow-sm w-[6px] h-[43%] -translate-x-1/2 -translate-y-full",
            !isDraggingRef.current && "transition-transform duration-300 ease-in-out",
            { "cursor-move": precision === "minute" && draggable && !!onChange }
          )}
          style={{
            transform: `rotate(${minuteDegrees}deg)`,
          }}
          onMouseDown={precision === "minute" ? handleDragStart : undefined}
          onTouchStart={precision === "minute" ? handleDragStart : undefined}
        />

        {/* 秒針 */}
        {precision === "second" && (
          <div
            className={cn(
              "absolute top-1/2 left-1/2 origin-bottom rounded-full bg-red-500 shadow-sm w-[1px] h-[43%] -translate-x-1/2 -translate-y-full transition-transform duration-300 ease-in-out",
              {
                "cursor-move": precision === "second" && draggable && !!onChange,
              },
            )}
            style={{
              transform: `rotate(${secondDegrees}deg)`,
            }}
            onMouseDown={precision === "second" ? handleDragStart : undefined}
            onTouchStart={precision === "second" ? handleDragStart : undefined}
          />
        )}
      </>
    );
  };

  return (
    <div
      id="clock"
      ref={clockRef}
      className={cn(
        "relative overflow-hidden h-64 w-64 rounded-full border-4 border-gray-800 bg-white",
        className,
      )}
    >
      {renderClockHands()}
      {renderClockNumbers()}
      {renderClockTicks()}

      {/* 顯示上下午指示 */}
      {showAmPm && currentClockWidth && (
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 transform text-lg font-bold">
          {isAM ? "上午" : "下午"}
        </div>
      )}

      {/* 中心點 */}
      <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-black shadow" />
    </div>
  );
};

export default Clock;
