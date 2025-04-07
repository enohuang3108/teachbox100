"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MultipleChoiceAnswerProps {
  choices: number[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function MultipleChoiceAnswer({
  choices,
  selectedValue,
  onSelect,
}: MultipleChoiceAnswerProps) {
  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={onSelect}
      className="space-y-2"
    >
      {choices.map((choice, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <RadioGroupItem
            value={choice.toString()}
            id={`choice-${index}`}
            className="peer"
          />
          <Label
            htmlFor={`choice-${index}`}
            className="text-lg md:text-xl cursor-pointer flex-1 peer-checked:text-blue-600"
          >
            {choice} 元
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
