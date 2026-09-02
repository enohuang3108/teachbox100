"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { useTransitionRouter } from "next-view-transitions";

export interface Sibling {
  path: string;
  title: string;
}

/**
 * 麵包屑最後一節：點下去可以切到同一個分類底下的其他單元。
 * 沒有兄弟單元時退回純文字，不長出一顆按不出東西的按鈕。
 */
export const UnitSwitcher = ({
  title,
  path,
  siblings,
}: {
  title: string;
  path: string;
  siblings: Sibling[];
}) => {
  const router = useTransitionRouter();

  if (siblings.length < 2) {
    return (
      <span aria-current="page" className="px-1.5 py-0.5">
        {title}
      </span>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-current="page"
        className="text-ink hover:bg-ink/[0.06] data-[state=open]:bg-ink/[0.06] group flex max-w-[45vw] items-center gap-1 rounded-md px-1.5 py-0.5 transition-[background-color,transform] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ink/20 active:scale-[0.97] sm:max-w-none"
      >
        <span className="truncate">{title}</span>
        <ChevronDown
          className="text-ink-soft size-3.5 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="border-ink/10 bg-paper data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 z-50 min-w-[13rem] origin-[var(--radix-dropdown-menu-content-transform-origin)] rounded-xl border p-1 shadow-[0_8px_24px_-8px_rgb(2_13_21_/_0.18)] duration-150 ease-out"
        >
          {siblings.map((s) => {
            const current = s.path === path;
            return (
              <DropdownMenu.Item
                key={s.path}
                onSelect={() => !current && router.push(s.path)}
                className="text-ink-soft data-[highlighted]:bg-sand data-[highlighted]:text-ink flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none data-[current=true]:font-bold data-[current=true]:text-ink"
                data-current={current}
              >
                {s.title}
                {current && <Check className="size-4 shrink-0" aria-hidden />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
