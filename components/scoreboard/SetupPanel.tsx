"use client";

import {
  MAX_TEAMS,
  MIN_TEAMS,
  useScoreboardStore,
  TONES,
  type ToneKey,
  teamHue,
  toneStyle,
} from "@/lib/scoreboard/store";
import { Switch } from "@/components/atoms/shadcn/switch";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { StepSetup } from "@/components/organisms/StepSetup";
import { Palette, Users } from "lucide-react";
import { Input } from "@/components/atoms/shadcn/input";
import { useState } from "react";
import { BuzzPanel } from "./BuzzPanel";
import { closeRoom, openRoom, useBuzzStore } from "@/lib/scoreboard/buzz";

const chip = (active: boolean) =>
  `flex flex-col items-start gap-2 rounded-2xl border bg-background px-4 py-3 text-sm font-semibold text-ink transition-[border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] ${
    active ? "border-ink ring-1 ring-ink" : "border-border hover:border-ink/30"
  }`;

/** 開始前的設定旅程：組別 → 外觀。放在 DialogContent 裡用，介紹頁與頂列的設定鈕共用 */
export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { teams, tone, hueSeed, setTeamCount, setNames, setTone } =
    useScoreboardStore();
  const [draft, setDraft] = useState(() => teams.map((t) => t.name).join("\n"));
  const linked = useBuzzStore((s) => s.code !== null);
  const [linking, setLinking] = useState(false);

  const [countText, setCountText] = useState(String(teams.length));
  const applyCount = (n: number) => {
    setTeamCount(n);
    const next = useScoreboardStore.getState().teams;
    setCountText(String(next.length));
    setDraft(next.map((t) => t.name).join("\n"));
  };

  const applyNames = () => {
    const names = draft
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length < MIN_TEAMS) return;
    setNames(names);
    setCountText(String(useScoreboardStore.getState().teams.length));
  };

  return (
    <StepSetup
      title="計分板設定"
      startLabel="開始計分"
      onStart={() => {
        // textarea 沒失焦就直接按開始，名單也要吃進去
        if (!linked) applyNames();
        onStart();
      }}
      steps={[
        {
          key: "teams",
          label: "組別",
          icon: Users,
          summary: linked ? "連線搶答" : `${teams.length} 組`,
          content: (
            <section className="space-y-6">
              <header>
                <h3 className="text-h3 text-ink">要幫誰計分？</h3>
                <DialogDescription className="mt-1">
                  分組競賽設組數或貼名單；要搶答就打開連線，學生用手機加入。
                </DialogDescription>
              </header>

              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background px-4 py-3.5">
                <label
                  htmlFor="scoreboard-buzz"
                  className="flex cursor-pointer items-start justify-between gap-4"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">
                      連線搶答
                    </span>
                    <span className="mt-0.5 block text-caption text-muted-foreground">
                      {linked
                        ? "格數由連線人數決定，學生的名字就是格名。"
                        : "學生掃 QR 加入，手機上只有一顆搶答鈕；組數改由連線人數決定。"}
                    </span>
                  </span>
                  <Switch
                    id="scoreboard-buzz"
                    checked={linked}
                    disabled={linking}
                    className="mt-0.5"
                    onCheckedChange={async (v) => {
                      if (!v) return closeRoom();
                      setLinking(true);
                      await openRoom().finally(() => setLinking(false));
                    }}
                  />
                </label>
                <BuzzPanel />
              </div>

              {!linked && (
                <>
                  <fieldset className="flex flex-col gap-3">
                    <legend className="text-sm font-semibold text-ink">
                      幾組計分
                    </legend>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        inputMode="numeric"
                        aria-label="組數"
                        min={MIN_TEAMS}
                        max={MAX_TEAMS}
                        value={countText}
                        onChange={(e) => {
                          setCountText(e.target.value);
                          const n = Number(e.target.value);
                          // 打「12」的途中會先出現「1」，不到下限先不套用，失焦再夾回範圍
                          if (Number.isInteger(n) && n >= MIN_TEAMS)
                            applyCount(n);
                        }}
                        onBlur={() =>
                          applyCount(Number(countText) || MIN_TEAMS)
                        }
                        className="w-24 bg-background text-base tabular-nums"
                      />
                      <span className="text-caption text-muted-foreground tabular-nums">
                        組，{MIN_TEAMS}–{MAX_TEAMS}
                      </span>
                    </div>
                  </fieldset>
                  <fieldset className="flex flex-col gap-3">
                    <legend className="text-sm font-semibold text-ink">
                      組名／姓名
                    </legend>
                    <p className="text-caption text-muted-foreground">
                      一行一個，貼上全班名單就會一人一格。分數不會被清掉。
                    </p>
                    <textarea
                      aria-label="組名，一行一個"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={applyNames}
                      rows={Math.min(12, Math.max(4, teams.length))}
                      spellCheck={false}
                      className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-base leading-[1.75] text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    />
                  </fieldset>
                </>
              )}
            </section>
          ),
        },
        {
          key: "look",
          label: "外觀",
          icon: Palette,
          summary: TONES[tone].label,
          content: (
            <section className="space-y-5">
              <header>
                <h3 className="text-h3 text-ink">卡片要什麼顏色？</h3>
                <DialogDescription className="mt-1">
                  每組一個顏色，投影時一眼分得出是哪一組。
                </DialogDescription>
              </header>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(Object.keys(TONES) as ToneKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={tone === k}
                    onClick={() => setTone(k)}
                    className={chip(tone === k)}
                  >
                    {/* 色票就是計分板前四組卡片實際的樣子 */}
                    <span aria-hidden className="flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="size-7 rounded-md border"
                          style={toneStyle(k, teamHue(hueSeed, i))}
                        />
                      ))}
                    </span>
                    {TONES[k].label}
                  </button>
                ))}
              </div>
            </section>
          ),
        },
      ]}
    />
  );
}
