"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { Button } from "@/components/atoms/shadcn/button";
import { Dialog, DialogContent } from "@/components/atoms/shadcn/dialog";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { colorOf, LadderBoard } from "@/components/ladder/LadderBoard";
import { SetupPanel } from "@/components/ladder/SetupPanel";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { StageFixed } from "@/components/templates/StageFixed";
import { ui } from "@/lib/hooks/useSound";
import {
  buildLadder,
  groupLabels,
  parseNames,
  parseResults,
  trace,
  type Ladder,
} from "@/lib/ladder/game";
import { useLadderStore } from "@/lib/ladder/store";
import { defaultRng } from "@/lib/monopoly/rng";
import { useSharedSetup } from "@/lib/share/useSharedSetup";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const pageInfo: PageWithKey = { ...pages.ladder, key: "ladder" };

const ROUND_BTN =
  "size-16 rounded-full p-0 transition-transform duration-press ease-out active:scale-[0.97]";

interface Round {
  ladder: Ladder;
  names: string[];
  labels: string[];
}

export default function LadderPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [entered, setEntered] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  useSharedSetup("ladder", (setup) => {
    useLadderStore.setState(setup);
    setSetupOpen(true);
  });
  const { names, mode, results, groupCount, hideResults, sound, setSound } =
    useLadderStore();

  const [round, setRound] = useState<Round | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [focus, setFocus] = useState<number | null>(null);

  // 每次開始或重畫都亂畫一張新的格子；名單與結果照設定
  const redraw = () => {
    const list = parseNames(names);
    const ladder = buildLadder(list.length, defaultRng);
    const labels =
      mode === "groups"
        ? groupLabels(list.length, groupCount, defaultRng)
        : parseResults(results);
    setRound({ ladder, names: list, labels });
    setRevealed([]);
    setFocus(null);
  };

  const ends = useMemo(
    () => round?.names.map((_, i) => trace(round.ladder, i).end) ?? [],
    [round],
  );
  const resultOf = (player: number) => round!.labels[ends[player]];
  const players = round?.names.length ?? 0;
  const done = players > 0 && revealed.length === players;
  const next = round?.names.findIndex((_, i) => !revealed.includes(i)) ?? -1;

  const onTraced = (player: number) => {
    if (revealed.includes(player)) return;
    setRevealed((r) => [...r, player]);
    if (sound) ui.play("reward");
  };
  const step = (delta: number) =>
    setFocus((f) => (f === null ? (delta > 0 ? 0 : players - 1) : (f + delta + players) % players));

  useEffect(() => {
    if (!round || setupOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const focused = focus !== null && revealed.includes(focus) ? focus : null;

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="重畫格子">
        <RefreshCWIcon
          className={ACTION_BTN}
          size={20}
          aria-label="重畫格子"
          onClick={redraw}
        />
      </Tip>
      <SettingsButton onClick={() => setSetupOpen(true)} />
      <SoundToggleButton on={sound} onToggle={setSound} />
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  const groups =
    mode === "groups" && round
      ? Array.from({ length: groupCount }, (_, g) => `第 ${g + 1} 組`).map((group) => ({
          group,
          members: revealed.filter((p) => resultOf(p) === group).map((p) => round.names[p]),
        }))
      : null;

  return (
    <>
      <PageTemplate
        page={pageInfo}
        actions={actions}
        landing={{
          startLabel: "開始使用",
          onStart: () => setSetupOpen(true),
          entered,
        }}
      >
        {hydrated && round && (
          <div className="flex flex-col items-center pr-24 sm:pr-28 lg:pl-64">
            <div className="flex min-h-20 items-end justify-center text-center" aria-live="polite">
              {focused !== null ? (
                <p
                  data-testid="ladder-result"
                  className="font-display text-4xl leading-tight font-black text-ink animate-in fade-in-0 zoom-in-95 duration-200 sm:text-5xl"
                >
                  <span style={{ color: colorOf(focused) }}>{round.names[focused]}</span>
                  <span className="mx-3 text-ink-soft">→</span>
                  {resultOf(focused)}
                </p>
              ) : (
                <p className="text-caption text-muted-foreground">
                  {done
                    ? "全部揭曉了，點名字或按左右鍵看每個人的路線"
                    : "點上面的名字，或按右下角的「爬下一位」"}
                </p>
              )}
            </div>

            <div className="mt-4 w-full max-w-6xl">
              <LadderBoard
                ladder={round.ladder}
                names={round.names}
                labels={round.labels}
                revealed={revealed}
                focus={focus}
                hideResults={hideResults}
                onPick={setFocus}
                onTraced={onTraced}
              />
            </div>

            <aside
              aria-label="爬格子結果"
              className="fixed top-20 left-4 z-(--z-sticky) hidden w-60 rounded-3xl bg-card/90 px-5 pt-5 pb-4 shadow-sm lg:block [#game-stage:fullscreen_&]:top-4"
            >
              <h2 className="font-display text-2xl font-extrabold text-ink">
                {groups ? "分組結果" : "結果清單"}
              </h2>
              <p className="mt-0.5 text-caption text-ink-soft tabular-nums">
                {done ? "全部爬完了" : `已揭曉 ${revealed.length} / ${players} 人`}
              </p>
              <div className="mt-2 max-h-[60svh] overflow-y-auto">
                {groups ? (
                  <ul className="divide-y divide-border">
                    {groups.map(({ group, members }) => (
                      <li key={group} className="py-2.5">
                        <p className="text-sm font-bold text-ink">{group}</p>
                        <p className="text-sm text-ink-soft">
                          {members.length ? members.join("、") : "—"}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : revealed.length === 0 ? (
                  <p className="text-caption text-ink-soft">還沒有人爬。</p>
                ) : (
                  <ol className="divide-y divide-border">
                    {revealed.map((p) => (
                      <li key={p}>
                        <button
                          type="button"
                          onClick={() => setFocus(p)}
                          className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm"
                        >
                          <span className="min-w-0 truncate font-bold" style={{ color: colorOf(p) }}>
                            {round.names[p]}
                          </span>
                          <span className="min-w-0 truncate font-bold text-ink">{resultOf(p)}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </aside>

            <StageFixed>
              <div className="fixed right-6 bottom-6 z-(--z-sticky) flex flex-col items-center gap-3">
                <Button variant="outline" aria-label="全部揭曉" className={ROUND_BTN} disabled={done}
                  onClick={() => {
                    setRevealed(round.names.map((_, i) => i));
                    setFocus(null);
                  }}>
                  <Eye className="size-6" />
                </Button>
                <Button variant="outline" aria-label="上一位" className={ROUND_BTN} onClick={() => step(-1)}>
                  <ChevronLeft className="size-7" />
                </Button>
                <Button variant="outline" aria-label="下一位" className={ROUND_BTN} onClick={() => step(1)}>
                  <ChevronRight className="size-7" />
                </Button>
                <Button
                  onClick={() => setFocus(next)}
                  disabled={done}
                  className="mt-2 size-24 rounded-full p-0 text-lg font-bold transition-transform duration-press ease-out active:scale-[0.97]"
                >
                  爬下一位
                </Button>
              </div>
            </StageFixed>
          </div>
        )}
      </PageTemplate>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <SetupPanel
            onStart={() => {
              redraw();
              setSetupOpen(false);
              setEntered(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
