"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { Input } from "@/components/atoms/shadcn/input";

interface KeypadAnswerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** 輸入框顯示的樣子，例如時鐘把「930」顯示成「9:30」 */
  display?: (value: string) => string;
}

export default function KeypadAnswer({
  value,
  onChange,
  placeholder = "輸入金額",
  display = (v) => v,
}: KeypadAnswerProps) {
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
          value={display(value)}
          className="py-4 text-center text-xl md:py-6 md:text-2xl"
          placeholder={placeholder}
          readOnly
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => handleButtonClick(num.toString())}
            className="bg-muted py-3 text-lg text-foreground hover:bg-accent md:py-4 md:text-xl"
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={() => handleButtonClick("clear")}
          className="bg-danger-soft py-3 text-lg text-danger-ink hover:bg-danger/20 md:py-4 md:text-xl"
        >
          清除
        </Button>
        <Button
          onClick={() => handleButtonClick("0")}
          className="bg-muted py-3 text-lg text-foreground hover:bg-accent md:py-4 md:text-xl"
        >
          0
        </Button>
        <Button
          onClick={() => handleButtonClick("backspace")}
          className="bg-warning-soft py-3 text-lg text-warning-ink hover:bg-warning/20 md:py-4 md:text-xl"
        >
          ←
        </Button>
      </div>
    </div>
  );
}
