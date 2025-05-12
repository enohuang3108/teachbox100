"use client";

import { Label } from "@/components/atoms/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import { cn } from "@/lib/utils";

type AnswerMode = "multiple-choice" | "digit";

interface CurrentTimeSettingPanelProps {
  answerMode: AnswerMode;
  onAnswerModeChange: (mode: AnswerMode) => void;
}

export default function CurrentTimeSettingPanel({
  answerMode,
  onAnswerModeChange,
}: CurrentTimeSettingPanelProps) {
  const modes = {
    "multiple-choice": {
      label: "選擇題",
      bg: "group-has-[span[data-state=checked]]:bg-purple-100 hover:bg-purple-50",
      border: "group-has-[span[data-state=checked]]:border-purple-400",
    },
    digit: {
      label: "數字調整",
      bg: "group-has-[span[data-state=checked]]:bg-blue-100 hover:bg-blue-50",
      border: "group-has-[span[data-state=checked]]:border-blue-400",
    },
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="mb-2 text-sm font-medium text-gray-700">回答方式</h3>
        <RadioGroup
          value={answerMode}
          onValueChange={onAnswerModeChange}
          className="space-y-2"
        >
          {Object.entries(modes).map(([value, scheme]) => (
            <Label key={value} className="group">
              <div
                className={cn(
                  "flex w-full cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors",
                  scheme.bg,
                  scheme.border,
                )}
              >
                <RadioGroupItem value={value} id={`answer-${value}`} />
                <span className="text-sm font-medium">{scheme.label}</span>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>
      {/* TODO: Add precision setting (minute/second) */}
    </div>
  );
}
