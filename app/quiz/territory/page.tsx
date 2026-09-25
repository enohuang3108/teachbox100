"use client";

import { useEffect, useRef, useState } from "react";
import { pages, type PageWithKey } from "@/app/pages.config";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { SetupPanel } from "@/components/territory/SetupPanel";
import { TerritoryStage } from "@/components/territory/TerritoryStage";
import { useTerritoryGame } from "@/components/territory/useTerritoryGame";
import { useSound } from "@/lib/hooks/useSound";
import { DEFAULT_QUESTIONS } from "@/lib/questions/default-questions";
import { useSharedSetup } from "@/lib/share/useSharedSetup";
import { useTerritoryStore } from "@/lib/territory/store";

const pageInfo: PageWithKey = {
  ...pages["quiz-territory"],
  key: "quiz-territory",
};

export default function TerritoryPage() {
  // persist 要等 client 才有資料；SEO 區塊在 PageTemplate 裡照常 SSR，只擋遊戲本體
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [entered, setEntered] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const { bank, useDefault, cap, names, countdown, size, sound, setSound } =
    useTerritoryStore();
  useSharedSetup("quiz-territory", (setup) => {
    useTerritoryStore.setState({
      bank: setup.bank ?? [],
      useDefault: setup.bank === null,
      cap: setup.cap,
      names: setup.names,
      countdown: setup.countdown,
      size: setup.size,
    });
    setSetupOpen(true);
  });

  const { playCorrectSound, playWrongSound, playCountdownTick, playGoSound } =
    useSound();
  const game = useTerritoryGame(
    useDefault ? DEFAULT_QUESTIONS : bank,
    cap,
    countdown,
    size,
    (correct) => {
      if (!sound) return;
      if (correct) playCorrectSound();
      else playWrongSound();
    },
  );

  // 倒數每換一個數字響一拍，數完題目出現時再響一聲「開始」
  const lastCount = useRef<number | null>(null);
  useEffect(() => {
    const prev = lastCount.current;
    lastCount.current = game.countdown;
    if (!sound || prev === game.countdown) return;
    if (game.countdown !== null) playCountdownTick();
    else if (prev === 1 && game.question) playGoSound();
  }, [game.countdown, game.question, sound, playCountdownTick, playGoSound]);

  const begin = () => {
    game.restart();
    setSetupOpen(false);
    setEntered(true);
  };
  const openSettings = () => {
    // 局面動過又還沒分出勝負時，回設定會丟掉進行中的這一局
    if (game.changed.length > 0 && !game.over) setConfirmLeave(true);
    else setSetupOpen(true);
  };

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="重新開始">
        <RefreshCWIcon
          className={ACTION_BTN}
          size={20}
          aria-label="重新開始"
          onClick={game.restart}
        />
      </Tip>
      <SettingsButton onClick={openSettings} />
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
        {hydrated && <TerritoryStage game={game} names={names} sound={sound} />}
      </PageTemplate>

      {/* 放在 PageTemplate 外面：介紹頁階段 children 不渲染，設定要在那時就能開 */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <SetupPanel onStart={begin} />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>離開這一局？</DialogTitle>
            <DialogDescription>
              棋盤會清空，回到設定後要重新開始。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmLeave(false)}>
              繼續比
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmLeave(false);
                setSetupOpen(true);
              }}
            >
              回到設定
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
