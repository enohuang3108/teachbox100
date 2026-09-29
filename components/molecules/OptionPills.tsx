"use client";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import { SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

/** 設定裡的純單選：一排膠囊，選取態走 SELECTED_OPTION。選項有各自內容時改用 Tabs */
export function OptionPills<T extends string | number>({
  name,
  value,
  options,
  onChange,
}: {
  /** 同一頁有兩組時用來區分 id */
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <RadioGroup
      value={String(value)}
      onValueChange={(v) =>
        onChange(options.find((o) => String(o.value) === v)!.value)
      }
      className="flex flex-wrap gap-2"
    >
      {options.map((o) => (
        <label key={o.value} className="group" htmlFor={`${name}-${o.value}`}>
          <span
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-hover",
              SELECTED_OPTION,
            )}
          >
            <RadioGroupItem value={String(o.value)} id={`${name}-${o.value}`} />
            <span className="text-sm font-medium">{o.label}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
