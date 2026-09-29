"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { Button } from "@/components/atoms/shadcn/button";
import { Dialog, DialogContent } from "@/components/atoms/shadcn/dialog";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { SetupPanel } from "@/components/dice/SetupPanel";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { StageFixed } from "@/components/templates/StageFixed";
import { faceLabel, rollDice } from "@/lib/dice/game";
import { useDiceStore } from "@/lib/dice/store";
import { defaultRng } from "@/lib/monopoly/rng";
import { useSharedSetup } from "@/lib/share/useSharedSetup";
import { Howl } from "howler";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DiceTray = dynamic(() => import("@/components/dice/DiceTray"), {
  ssr: false,
});

const pageInfo: PageWithKey = { ...pages.dice, key: "dice" };
const HISTORY_LIMIT = 8;

let diceSound: Howl | undefined;
function playDiceSound() {
  diceSound ??= new Howl({ src: ["/sounds/dice.mp3?v=2"], volume: 0.6 });
  // 延後到骰子落地翻滾的那一刻，按下當下就響會比畫面早
  window.setTimeout(() => diceSound?.play(), 400);
}

export default function DicePage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [entered, setEntered] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  useSharedSetup("dice", (setup) => {
    useDiceStore.setState(setup);
    setSetupOpen(true);
  });
  const { count, mode, faces, sound, setSound } = useDiceStore();

  const [roll, setRoll] = useState<{ id: number; values: number[] } | null>(
    null,
  );
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const label = (values: number[]) =>
    values.map((v) => faceLabel(v, mode, faces));
  const total = roll?.values.reduce((sum, v) => sum + v, 0) ?? 0;

  const throwDice = () => {
    const values = rollDice(count, defaultRng);
    setRoll((r) => ({ id: (r?.id ?? 0) + 1, values }));
    setRolling(true);
    if (sound) playDiceSound();
  };

  const settle = () => {
    setRolling(false);
    if (!roll) return;
    const text = label(roll.values).join("、");
    const summary =
      mode === "number" && roll.values.length > 1 ? `${text}（${total}）` : text;
    setHistory((h) => [summary, ...h].slice(0, HISTORY_LIMIT));
  };

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <SettingsButton onClick={() => setSetupOpen(true)} />
      <SoundToggleButton on={sound} onToggle={setSound} />
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  // 還沒擲過時擺一組落定的骰子當待機畫面，顆數跟設定一樣
  const shown = roll?.values ?? Array.from({ length: count }, (_, i) => 6 - i);

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
        {hydrated && (
          <div className="flex flex-col items-center pr-28 sm:px-28">
            <div
              className="flex min-h-28 flex-col items-center justify-end text-center"
              aria-live="polite"
            >
              {roll && !rolling ? (
                <>
                  <p
                    data-testid="dice-result"
                    className="flex flex-wrap justify-center gap-x-5 gap-y-1 font-display text-4xl leading-tight font-black text-ink animate-in fade-in-0 zoom-in-95 duration-200 sm:text-5xl"
                  >
                    {label(roll.values).map((text, i) => (
                      <span key={i}>{text}</span>
                    ))}
                  </p>
                  {mode === "number" && roll.values.length > 1 && (
                    <p className="mt-1 text-body-lg text-ink-soft tabular-nums">
                      總和 <span className="font-bold text-ink">{total}</span>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-caption text-muted-foreground">
                  {rolling ? "骰子滾動中…" : "按右下角的「擲骰」開始"}
                </p>
              )}
            </div>

            <div className="h-[min(60svh,34rem)] w-full max-w-5xl">
              <DiceTray
                key={roll?.id ?? "idle"}
                values={shown}
                mode={mode}
                faces={faces}
                still={!roll}
                onSettled={roll ? settle : undefined}
              />
            </div>

            {history.length > 0 && (
              <aside
                aria-label="擲骰紀錄"
                className="fixed top-20 left-4 z-(--z-sticky) hidden w-56 rounded-3xl bg-card/90 px-5 pt-5 pb-4 shadow-sm lg:block [#game-stage:fullscreen_&]:top-4"
              >
                <h2 className="font-display text-2xl font-extrabold text-ink">
                  擲骰紀錄
                </h2>
                <ol className="mt-2 divide-y divide-border">
                  {history.map((text, index) => (
                    <li key={history.length - index} className="py-2.5 text-sm font-bold text-ink">
                      {text}
                    </li>
                  ))}
                </ol>
              </aside>
            )}

            <StageFixed>
              <div className="fixed right-6 bottom-6 z-(--z-sticky) flex flex-col items-center gap-3">
                <Button
                  onClick={throwDice}
                  disabled={rolling}
                  className="mt-2 size-24 rounded-full p-0 text-xl font-bold transition-transform duration-press ease-out active:scale-[0.97]"
                >
                  擲骰
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
              setRoll(null);
              setHistory([]);
              setSetupOpen(false);
              setEntered(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
