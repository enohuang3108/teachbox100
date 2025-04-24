"use client";

import { cn } from "@/lib/utils";
import { FC, useCallback, useEffect, useRef, useState } from "react";

type Precision = "minute" | "second";

// 重構策略模式，減少重複代碼
type TimeStrategy = {
  unitDegrees: number; // 每單位的角度
  getTime: (date: Date) => number; // 獲取對應單位的時間
  setTime: (date: Date, value: number) => Date; // 設置對應單位的時間
};

const createTimeStrategy = (
  unitDegrees: number,
  getTimeFn: (date: Date) => number,
  setTimeFn: (date: Date, value: number) => Date,
): TimeStrategy => ({
  unitDegrees,
  getTime: getTimeFn,
  setTime: setTimeFn,
});

const timeStrategies: Record<Precision, TimeStrategy> = {
  minute: createTimeStrategy(
    6, // 每分鐘6度
    (date) => date.getMinutes(),
    (date, value) => {
      const newDate = new Date(date);
      newDate.setMinutes(value);
      return newDate;
    },
  ),
  second: createTimeStrategy(
    6, // 每秒6度
    (date) => date.getSeconds(),
    (date, value) => {
      const newDate = new Date(date);
      newDate.setSeconds(value);
      return newDate;
    },
  ),
};

// 通用的角度轉時間函數
const angleToTimeValue = (angle: number): number => {
  // 將角度標準化為0-360，考慮12點鐘方向為0度的偏移
  return Math.floor(((angle + 90) % 360) / 6);
};

interface ClockProps {
  precision?: Precision;
  initialTime?: Date;
  onChange?: (time: Date) => void;
  className?: string;
  draggable?: boolean;
}

const Clock: FC<ClockProps> = ({
  precision = "second",
  initialTime,
  onChange,
  className,
  draggable = true,
}) => {
  const clockRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [time, setTime] = useState<Date>(initialTime || new Date());
  const dragPreviousTimeRef = useRef<Date | null>(null);

  // 選擇當前策略
  const currentStrategy = timeStrategies[precision];

  // 計算滑鼠點擊或觸摸事件的角度
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

  // 處理拖動開始
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // 若不可拖動則直接返回
      if (!draggable) return;

      e.preventDefault();
      isDraggingRef.current = true;
      // 在拖動開始時，設置 Ref 的初始值
      dragPreviousTimeRef.current = new Date(time);

      const updateTimeFromDrag = (event: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current || !dragPreviousTimeRef.current) return;

        const angle = calculateAngle(event);
        const timeValue = angleToTimeValue(angle); // 獲取新的分鐘/秒數值 (0-59)

        // 從 Ref 中獲取上一次拖動的時間狀態
        const baseTime = dragPreviousTimeRef.current;
        let newTime = currentStrategy.setTime(baseTime, timeValue);

        // --- 處理分針跨越整點 ---
        if (precision === "minute") {
          const previousMinutes = dragPreviousTimeRef.current.getMinutes();
          const newMinutes = timeValue; // timeValue 在 minute 模式下就是 newMinutes
          const currentHours = newTime.getHours();

          // 偵測向前跨越 (例如從 58 分 -> 2 分)
          if (previousMinutes >= 50 && newMinutes <= 9) {
            newTime.setHours(currentHours + 1);
          }
          // 偵測向後跨越 (例如從 2 分 -> 58 分)
          else if (previousMinutes <= 9 && newMinutes >= 50) {
            newTime.setHours(currentHours - 1);
          }
        }
        // --- 結束處理 ---

        setTime(newTime);
        onChange?.(newTime);

        // 更新 Ref 以記錄本次拖動後的時間
        dragPreviousTimeRef.current = new Date(newTime);
      };

      const handleMove = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        updateTimeFromDrag(event);
      };

      const handleEnd = () => {
        isDraggingRef.current = false;
        dragPreviousTimeRef.current = null; // 拖動結束時重置 Ref
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
  ); // 確保依賴正確

  // 時鐘的自動更新
  useEffect(() => {
    if (initialTime) {
      setTime(initialTime);
    } else {
      const timer = setInterval(() => {
        setTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [initialTime]);

  // 計算指針角度
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const hourDegrees = hours * 30 + minutes * 0.5; // 每小時30度 + 分鐘的影響
  const minuteDegrees = minutes * 6; // 每分鐘6度
  const secondDegrees = time.getSeconds() * 6; // 每秒6度

  // 渲染時鐘數字
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
          { "cursor-move": precision === "minute" && draggable },
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
      <div
        className={cn(
          "absolute top-1/2 left-1/2 origin-bottom rounded-full bg-red-500 shadow-sm",
          { "cursor-move": precision === "second" && draggable },
        )}
        style={{
          height: "43%",
          width: "1px",
          transform: `translate(-50%, -100%) rotate(${secondDegrees}deg)`,
        }}
        onMouseDown={precision === "second" ? handleDragStart : undefined}
        onTouchStart={precision === "second" ? handleDragStart : undefined}
      />

      {/* 中心點 */}
      <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-black shadow" />
    </div>
  );
};

export default Clock;
