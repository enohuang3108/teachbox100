"use client";

import {
  MAX_TEAMS,
  MIN_TEAMS,
  useScoreboardStore,
  TONES,
  type ToneKey,
} from "@/lib/scoreboard/store";
import { Button } from "@/components/atoms/shadcn/button";
import { Switch } from "@/components/atoms/shadcn/switch";
import { Slider } from "@/components/atoms/shadcn/slider";
import { useState } from "react";
import { BuzzPanel } from "./BuzzPanel";
import { closeRoom, openRoom, useBuzzStore } from "@/lib/scoreboard/buzz";

const chip = (active: boolean) =>
  `rounded-full border px-4 py-2 text-base font-semibold tabular-nums transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
    active
      ? "bg-ink border-ink text-paper"
      : "bg-paper-warm border-ink/10 text-ink-soft hover:text-ink"
  }`;

export function ScoreboardSettings() {
  const {
    teams,
    sound,
    tone,
    setTeamCount,
    setNames,
    setSound,
    setTone,
    shuffleColors,
  } = useScoreboardStore();
  const [draft, setDraft] = useState(() => teams.map((t) => t.name).join("\n"));
  const linked = useBuzzStore((s) => s.code !== null);
  const [linking, setLinking] = useState(false);

  const applyNames = () => {
    const names = draft
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length >= MIN_TEAMS) setNames(names);
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3">
          <Switch
            checked={linked}
            disabled={linking}
            onCheckedChange={async (v) => {
              if (!v) return closeRoom();
              setLinking(true);
              await openRoom().finally(() => setLinking(false));
            }}
          />
          <span className="text-ink font-semibold">連線搶答</span>
        </label>
        <p className="text-ink-soft text-sm leading-[1.75]">
          {linked
            ? "格數由連線人數決定，學生的名字就是格名。"
            : "開啟後學生掃 QR 加入，手機上只有一顆搶答鈕；幾組計分改由連線人數決定。"}
        </p>
        <BuzzPanel />
      </div>

      {!linked && (
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="text-ink font-semibold">幾組計分</legend>
            <p className="text-ink-soft text-sm leading-[1.75]">
              最多 {MAX_TEAMS} 組，一人一格點名計分也夠用。
            </p>
            <div className="flex items-center gap-4">
              <Slider
                value={[teams.length]}
                min={MIN_TEAMS}
                max={MAX_TEAMS}
                step={1}
                onValueChange={([n]) => setTeamCount(n)}
                aria-label="組數"
                className="flex-1"
              />
              <span className="text-ink w-10 text-right text-2xl leading-none font-bold tabular-nums">
                {teams.length}
              </span>
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="text-ink font-semibold">組名／姓名</legend>
            <p className="text-ink-soft text-sm leading-[1.75]">
              一行一個，貼上全班名單就會一人一格，最多 {MAX_TEAMS}{" "}
              格。分數不會被清掉。
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={applyNames}
              rows={Math.min(12, Math.max(4, teams.length))}
              className="border-ink/10 bg-paper-warm text-ink focus:border-ink/25 w-full rounded-lg border p-3 text-base leading-[1.75] outline-none transition-colors duration-150 ease-out"
            />
            <Button onClick={applyNames} className="self-start">
              套用名單
            </Button>
          </fieldset>
        </>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-ink font-semibold">卡片色調</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TONES) as ToneKey[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={tone === k}
              onClick={() => setTone(k)}
              className={chip(tone === k)}
            >
              {TONES[k].label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={shuffleColors}
          className="self-start"
        >
          換一批顏色
        </Button>
      </fieldset>

      <label className="flex items-center gap-3">
        <Switch checked={sound} onCheckedChange={setSound} />
        <span className="text-ink font-semibold">加減分音效</span>
      </label>

      <p className="text-ink-soft text-base leading-[1.75]">
        計分板上的卡片只用來加減分，改名請在這裡改。一次加減幾分在計分板上方選。
      </p>
    </div>
  );
}
