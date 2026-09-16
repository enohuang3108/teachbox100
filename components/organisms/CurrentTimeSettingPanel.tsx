"use client";

import { Label } from "@/components/atoms/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import { cn } from "@/lib/utils";
import { SELECTED_OPTION } from "@/lib/ui-classes";

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
    "multiple-choice": "選擇題",
    digit: "數字調整",
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="mb-2 text-sm font-medium text-foreground">回答方式</h3>
        <RadioGroup
          value={answerMode}
          onValueChange={onAnswerModeChange}
          className="space-y-2"
        >
          {Object.entries(modes).map(([value, label]) => (
            <Label key={value} className="group">
              <div
                className={cn(
                  "flex w-full cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors",
                  SELECTED_OPTION,
                )}
              >
                <RadioGroupItem value={value} id={`answer-${value}`} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>
      {/* TODO: Add precision setting (minute/second) */}
    </div>
  );
}
