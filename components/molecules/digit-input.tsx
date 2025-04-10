"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DigitInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DigitInput({ value, onChange }: DigitInputProps) {
  const handleDigitChange = (position: number, increment: number) => {
    const digits = value.padStart(3, "0").split("");
    const currentDigit = parseInt(digits[position]) || 0;
    const newDigit = (currentDigit + increment + 10) % 10;
    digits[position] = newDigit.toString();
    onChange(digits.join(""));
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      {["百位", "十位", "個位"].map((label, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-2">{label}</div>
          <div className="flex flex-col items-center space-y-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => handleDigitChange(index, 1)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <div className="w-12 h-12 flex items-center justify-center border rounded-lg text-xl font-bold bg-white">
              {value.padStart(3, "0")[index]}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => handleDigitChange(index, -1)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
