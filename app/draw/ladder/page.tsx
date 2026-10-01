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
import { useEffect, useMemo, useRef, useState } from "react";

const pageInfo: PageWithKey = { ...pages.ladder, key: "ladder" };

/** 開場洗格子的長度：橫槓亂換、越換越慢，停下來才能開始爬 */
const SHUFFLE_MS = 3000;

const ROUND_BTN =
  "size-20 rounded-full p-0 text-base font-bold transition-transform duration-press ease-out active:scale-[0.97]";

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
  /** 已經出發的人（點名字、爬下一位、同時進行），出發了就會爬到底 */
  const [started, setStarted] = useState<number[]>([]);
  const [shuffling, setShuffling] = useState(false);
  const shuffleTimer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(shuffleTimer.current), []);

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
    setStarted([]);

    window.clearTimeout(shuffleTimer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShuffling(false);
      return;
    }
    setShuffling(true);
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / SHUFFLE_MS;
      if (t >= 1) return setShuffling(false);
      setRound(
        (r) => r && { ...r, ladder: buildLadder(list.length, defaultRng) },
      );
      // 跟著換格子喀一聲，越換越慢像輪盤停下來
      if (sound) ui.play("press", { volume: 0.5 });
      shuffleTimer.current = window.setTimeout(tick, 50 + 450 * t * t);
    };
    tick();
  };

  const ends = useMemo(
    () => round?.names.map((_, i) => trace(round.ladder, i).end) ?? [],
    [round],
  );
  const resultOf = (player: number) => round!.labels[ends[player]];
  const players = round?.names.length ?? 0;
  const next = round?.names.findIndex((_, i) => !started.includes(i)) ?? -1;

  const onTraced = (finished: number[]) => {
    const fresh = finished.filter((p) => !revealed.includes(p));
    if (!fresh.length) return;
    setRevealed((r) => [...r, ...fresh]);
    if (sound) ui.play("reward");
  };
  // 格子還在洗時不能出發；出發後換看別人，原本在爬的照樣爬完
  const start = (players: number[]) =>
    setStarted((s) => [...s, ...players.filter((p) => !s.includes(p))]);
  const pick = (player: number) => {
    if (shuffling) return;
    setFocus(player);
    start([player]);
  };
  const step = (delta: number) =>
    setFocus((f) =>
      f === null
        ? delta > 0
          ? 0
          : players - 1
        : (f + delta + players) % players,
    );

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
          <div className="flex flex-col items-center pr-24 sm:pr-28 [#game-stage:fullscreen_&]:h-[calc(100svh-3rem)]">
            <div
              className="flex min-h-20 items-end justify-center text-center"
              aria-live="polite"
            >
              {focused !== null ? (
                <p
                  data-testid="ladder-result"
                  className="font-display text-4xl leading-tight font-black text-ink animate-in fade-in-0 zoom-in-95 duration-200 sm:text-5xl"
                >
                  <span style={{ color: colorOf(focused) }}>
                    {round.names[focused]}
                  </span>
                  <span className="mx-3 text-ink-soft">→</span>
                  {resultOf(focused)}
                </p>
              ) : null}
            </div>

            <div className="mt-4 w-full [#game-stage:fullscreen_&]:min-h-0 [#game-stage:fullscreen_&]:flex-1">
              <LadderBoard
                ladder={round.ladder}
                names={round.names}
                labels={round.labels}
                revealed={revealed}
                focus={focus}
                started={started}
                hideResults={hideResults}
                onPick={pick}
                onTraced={onTraced}
              />
            </div>

            <StageFixed>
              <div className="fixed right-6 bottom-6 z-(--z-sticky) flex flex-col items-center gap-3">
                <Button
                  variant="outline"
                  className={ROUND_BTN}
                  disabled={next === -1 || shuffling}
                  onClick={() => {
                    setFocus(null);
                    start(round.names.map((_, i) => i));
                  }}
                >
                  同時進行
                </Button>
                <Button
                  onClick={() => pick(next)}
                  disabled={next === -1 || shuffling}
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
