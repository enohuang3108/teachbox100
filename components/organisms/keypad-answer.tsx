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
          className="py-4 text-center text-xl md:py-6 md:text-2xl"
          placeholder="輸入金額"
          readOnly
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => handleButtonClick(num.toString())}
            className="bg-gray-100 py-3 text-lg text-black hover:bg-gray-200 md:py-4 md:text-xl"
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={() => handleButtonClick("clear")}
          className="bg-red-100 py-3 text-lg text-red-700 hover:bg-red-200 md:py-4 md:text-xl"
        >
          清除
        </Button>
        <Button
          onClick={() => handleButtonClick("0")}
          className="bg-gray-100 py-3 text-lg text-black hover:bg-gray-200 md:py-4 md:text-xl"
        >
          0
        </Button>
        <Button
          onClick={() => handleButtonClick("backspace")}
          className="bg-yellow-100 py-3 text-lg text-yellow-700 hover:bg-yellow-200 md:py-4 md:text-xl"
        >
          ←
        </Button>
      </div>
    </div>
  );
}
