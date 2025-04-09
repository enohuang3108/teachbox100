"use client";

import { Button } from "@/components/ui/button";
import { DifficultyLevel } from "@/lib/types/types";
import { RotateCcw } from "lucide-react";

interface DifficultySelectorProps {
  difficulty: DifficultyLevel;
  onChange: (difficulty: DifficultyLevel) => void;
  onReset: () => void;
}

export default function DifficultySelector({
  difficulty,
  onChange,
  onReset,
}: DifficultySelectorProps) {
  // 難度對應的中文名稱和顏色
  const difficultyOptions: Array<{
    value: DifficultyLevel;
    label: string;
    color: string;
  }> = [
    { value: "easy", label: "簡單", color: "bg-green-600 hover:bg-green-700" },
    {
      value: "medium",
      label: "中等",
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
    { value: "hard", label: "困難", color: "bg-red-600 hover:bg-red-700" },
  ];

  return (
    <div className="bg-gray-900/80 rounded-xl shadow-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">難度選擇</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="hover:bg-gray-800 text-gray-300"
          title="重新開始"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {difficultyOptions.map((option) => (
          <Button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`${
              difficulty === option.value
                ? `${option.color} text-white`
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            } flex-1`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
