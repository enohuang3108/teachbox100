"use client";

import { Label } from "@/components/atoms/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";

interface MultipleChoiceAnswerProps {
  choices: number[] | string[];
  selectedValue: string;
  choicesText: (value: number | string) => string;
  onSelect: (value: string) => void;
}

export default function MultipleChoiceAnswer({
  choices,
  selectedValue,
  choicesText,
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
          className="flex cursor-pointer items-center space-x-2 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-100 w-full"
        >
          <RadioGroupItem value={choice.toString()} id={`choice-${index}`} />
          <Label
            htmlFor={`choice-${index}`}
            className="flex-1 cursor-pointer text-lg peer-checked:text-blue-600 md:text-xl"
          >
            {choicesText(choice)}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
