"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { Input } from "@/components/atoms/shadcn/input";

interface KeypadAnswerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function KeypadAnswer({ value, onChange }: KeypadAnswerProps) {
  const handleButtonClick = (digit: string) => {
    if (digit === "clear") {
      onChange("");
    } else if (digit === "backspace") {
      onChange(value.slice(0, -1));
    } else {
      onChange(value + digit);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xl md:text-2xl py-4 md:py-6 text-center"
          placeholder="輸入金額"
          readOnly
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => handleButtonClick(num.toString())}
            className="text-lg md:text-xl py-3 md:py-4 bg-gray-100 hover:bg-gray-200 text-black"
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={() => handleButtonClick("clear")}
          className="text-lg md:text-xl py-3 md:py-4 bg-red-100 hover:bg-red-200 text-red-700"
        >
          清除
        </Button>
        <Button
          onClick={() => handleButtonClick("0")}
          className="text-lg md:text-xl py-3 md:py-4 bg-gray-100 hover:bg-gray-200 text-black"
        >
          0
        </Button>
        <Button
          onClick={() => handleButtonClick("backspace")}
          className="text-lg md:text-xl py-3 md:py-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
        >
          ←
        </Button>
      </div>
    </div>
  );
}
