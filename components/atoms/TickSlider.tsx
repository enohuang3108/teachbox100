"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { rulerPosition, rulerTicks } from "@/lib/ui/ruler";

/** A tick-mark slider shared by the noise meter and number guessing game. */
export function TickSlider({
  value,
  onChange,
  min,
  max,
  step,
  tickEvery = step,
  majorEvery = tickEvery * 5,
  tickStart = min,
  orientation = "horizontal",
  label,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tickEvery?: number;
  majorEvery?: number;
  tickStart?: number;
  orientation?: "horizontal" | "vertical";
  label: string;
  className?: string;
}) {
  const vertical = orientation === "vertical";
  const ticks = vertical
    ? Array.from(
        { length: Math.floor((max - min) / tickEvery) + 1 },
        (_, index) => {
          const value = min + index * tickEvery;
          return {
            value,
            major: (value - min) % majorEvery === 0,
          };
        },
      )
    : rulerTicks({ min, max, every: tickEvery, majorEvery, start: tickStart });

  return (
    <div
      className={cn(
        vertical
          ? "contents"
          : "relative isolate h-20 w-full before:absolute before:inset-x-0 before:top-1/2 before:z-0 before:h-[68px] before:-translate-y-1/2 before:rounded-2xl before:border before:border-border before:bg-card",
        !vertical && className,
      )}
    >
      <SliderPrimitive.Root
        aria-label={label}
        orientation={orientation}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
        className={cn(
          "relative isolate flex touch-none select-none items-center",
          vertical
            ? "h-full w-10 flex-col"
            : "mx-auto h-20 w-[calc(100%-4rem)]",
          vertical && className,
        )}
      >
        <SliderPrimitive.Track
          className={cn("relative", vertical ? "h-full w-full" : "z-10 h-[68px] w-full")}
        >
          <div className={cn(!vertical && "absolute inset-x-3 inset-y-0")}>
            {ticks.map(({ value: tick, major }) => {
            const position = `${rulerPosition(tick, min, max)}%`;
            return (
              <span
                key={tick}
                aria-hidden
                className={cn(
                  "absolute rounded-full",
                  vertical
                    ? cn(
                        "left-1/2 h-[2px] -translate-x-1/2 translate-y-1/2",
                        major ? "w-5 bg-ink/45" : "w-3.5 bg-ink/15",
                      )
                    : cn(
                        "top-1/2 w-[2px] -translate-x-1/2 -translate-y-1/2",
                        major ? "h-7 bg-ink/35" : "h-5 bg-ink/10",
                      ),
                )}
                style={vertical ? { bottom: position } : { left: position }}
            />
          );
            })}
          </div>
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={label}
          className={cn(
            "group block cursor-grab touch-none focus-visible:outline-none active:cursor-grabbing",
            vertical ? "h-4 w-10" : "relative h-[54px] w-6",
          )}
        >
          {vertical && (
            <span className="absolute top-1/2 left-1/2 block h-2.5 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink transition-transform duration-press ease-out group-active:scale-x-110 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2" />
          )}
          {!vertical && (
            <>
              <svg
                aria-hidden
                viewBox="0 0 24 54"
                className="absolute inset-0 h-full w-full overflow-visible text-ink"
              >
                <path
                  d="M5 5 Q5 3 7 3 H17 Q19 3 19 5 Q19 6 18 7 L14 11 V43 L18 47 Q20 50 17 51 H7 Q4 50 6 47 L10 43 V11 L6 7 Q5 6 5 5Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
              <output className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-1 text-display font-bold text-ink tabular-nums">
                {value}
              </output>
            </>
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  );
}
