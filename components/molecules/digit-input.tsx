"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DigitInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function DigitInput({
  value,
  onChange,
  className,
}: DigitInputProps) {
  const handleDigitChange = (position: number, increment: number) => {
    const digits = value.padStart(4, "0").split("");
    const currentDigit = parseInt(digits[position]) || 0;
    const newDigit = (currentDigit + increment + 10) % 10;
    digits[position] = newDigit.toString();
    onChange(digits.join(""));
  };

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {["千位", "百位", "十位", "個位"].map((label, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="mb-1 text-lg font-medium text-gray-600">{label}</div>
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full transition-transform hover:bg-gray-100 active:scale-95 [&_svg]:size-8"
              onClick={() => handleDigitChange(index, 1)}
            >
              <ChevronUp />
            </Button>
            <div className="flex h-14 w-14 items-center justify-center rounded-md border border-gray-200 bg-white text-2xl font-bold shadow-sm">
              {value.padStart(4, "0")[index]}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full transition-transform hover:bg-gray-100 active:scale-95 [&_svg]:size-8"
              onClick={() => handleDigitChange(index, -1)}
            >
              <ChevronDown />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
