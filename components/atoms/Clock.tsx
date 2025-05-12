"use client";

import { cn } from "@/lib/utils";
import { FC, useCallback, useRef } from "react";

type Precision = "minute" | "second";

export interface ClockTime {
  hour: number; // 0-23
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
      isDraggingRef.current = true;
      dragStartTimeRef.current = { ...time }; // Copy time

      const updateTimeFromDrag = (event: MouseEvent | TouchEvent) => {
        const baseTime = dragStartTimeRef.current;
        if (!isDraggingRef.current || !baseTime) return;

        const angle = calculateAngle(event);
        const timeValue = angleToTimeValue(angle);

        let intermediateTime = currentStrategy.setTime(
          { ...baseTime },
          timeValue,
        );

        if (precision === "minute") {
          const previousMinutes = baseTime.minute;
          const newMinutes = intermediateTime.minute;
          let currentHours = baseTime.hour; // 0-23

          // Adjust hour if minute hand crosses 12
          if (previousMinutes >= 50 && newMinutes <= 9) {
            currentHours = (currentHours + 1) % 24;
          } else if (previousMinutes <= 9 && newMinutes >= 50) {
            currentHours = (currentHours - 1 + 24) % 24;
          }
          intermediateTime = { ...intermediateTime, hour: currentHours };
        }
        // Ensure onChange receives a new object for reactivity if needed
        onChange({ ...intermediateTime });
      };

      const handleMove = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        updateTimeFromDrag(event);
      };

      const handleEnd = () => {
        isDraggingRef.current = false;
        dragStartTimeRef.current = null;
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
    [calculateAngle, currentStrategy, draggable, onChange, precision, time],
  );

  // time.hour is 0-23
  const displayHour12 =
    time.hour === 0 || time.hour === 12 ? 12 : time.hour % 12; // For clock face numbers and hand
  const minutes = time.minute;
  const seconds = time.second ?? 0;
  const isAMForDisplay = time.hour < 12; // 0-11 is AM, 12-23 is PM

  const hourDegrees = (displayHour12 % 12) * 30 + minutes * 0.5; // (time.hour % 12) handles 0 as 12 for calculation if 0 means 12am
  const minuteDegrees = minutes * 6;
  const secondDegrees = seconds * 6;

  const renderClockNumbers = () => {
    return Array.from({ length: 12 }).map((_, i) => {
      const num = i + 1; // 1-12 的數字
      const deg = i * 30 + 30; // 每個數字間隔30度
      const distance = 140; // 距離中心的距離
      return (
        <div
          key={i}
          className={cn(
            "absolute text-base font-semibold",
            num % 3 === 0 ? "text-lg font-bold" : "text-base font-medium",
          )}
          style={{
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) rotate(${deg}deg) translate(0, -${distance}px) rotate(-${deg}deg)`,
          }}
        >
          {num}
        </div>
      );
    });
  };

  return (
    <div
      ref={clockRef}
      className={cn(
        "relative h-64 w-64 rounded-full border-4 border-gray-800 bg-white",
        className,
      )}
    >
      {renderClockNumbers()}

      {/* 顯示上下午指示 */}
      {showAmPm && (
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 transform text-lg font-bold">
          {isAMForDisplay ? "上午" : "下午"}
        </div>
      )}

      {/* 時針 - 較短較粗 */}
      <div
        className="absolute top-1/2 left-1/2 origin-bottom rounded-full bg-black shadow-md"
        style={{
          height: "28%",
          width: "4px",
          transform: `translate(-50%, -100%) rotate(${hourDegrees}deg)`,
        }}
      />

      {/* 分針 - 與秒針長度一致 */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 origin-bottom rounded-full bg-black shadow-sm",
          { "cursor-move": precision === "minute" && draggable && !!onChange },
        )}
        style={{
          height: "43%",
          width: "6px",
          transform: `translate(-50%, -100%) rotate(${minuteDegrees}deg)`,
        }}
        onMouseDown={precision === "minute" ? handleDragStart : undefined}
        onTouchStart={precision === "minute" ? handleDragStart : undefined}
      />

      {/* 秒針 - 紅色，與分針長度一致 */}
      {precision === "second" && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2 origin-bottom rounded-full bg-red-500 shadow-sm",
            {
              "cursor-move": precision === "second" && draggable && !!onChange,
            },
          )}
          style={{
            height: "43%",
            width: "1px",
            transform: `translate(-50%, -100%) rotate(${secondDegrees}deg)`,
          }}
          onMouseDown={precision === "second" ? handleDragStart : undefined}
          onTouchStart={precision === "second" ? handleDragStart : undefined}
        />
      )}

      {/* 中心點 */}
      <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-black shadow" />
    </div>
  );
};

export default Clock;
