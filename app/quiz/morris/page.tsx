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
import { MorrisStage } from "@/components/morris/MorrisStage";
import { SetupPanel } from "@/components/morris/SetupPanel";
import { useMorrisGame } from "@/components/morris/useMorrisGame";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import { GAME_STAGE_ID, PageTemplate } from "@/components/templates/PageTemplate";
import { useSound } from "@/lib/hooks/useSound";
import { useMorrisStore } from "@/lib/morris/store";
import { DEFAULT_QUESTIONS } from "@/lib/questions/default-questions";
import { useSharedSetup } from "@/lib/share/useSharedSetup";
import { FlagOff } from "lucide-react";

const pageInfo: PageWithKey = {
  ...pages["quiz-morris"],
  key: "quiz-morris",
};

export default function MorrisPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [entered, setEntered] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [confirmSettings, setConfirmSettings] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const { bank, useDefault, cap, names, sound, setSound } = useMorrisStore();
  useSharedSetup("quiz-morris", (setup) => {
    useMorrisStore.setState({
      bank: setup.bank ?? [],
      useDefault: setup.bank === null,
      cap: setup.cap,
      names: setup.names,
    });
    setSetupOpen(true);
  });

  const active = useDefault ? DEFAULT_QUESTIONS : bank;
  const game = useMorrisGame(active, cap);
  useGameSounds(game.state, sound);

  const begin = () => {
    game.restart();
    setSetupOpen(false);
    setEntered(true);
  };
  const openSettings = () => {
    const inProgress = game.state.board.some(Boolean) && game.state.phase !== "over";
    if (inProgress) setConfirmSettings(true);
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
      <Tip label="結束本局">
        <button
          type="button"
          aria-label="結束本局"
          className={`${ACTION_BTN} flex items-center justify-center`}
          disabled={game.state.phase === "over"}
          onClick={() => setConfirmEnd(true)}
        >
          <FlagOff size={20} />
        </button>
      </Tip>
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
        {hydrated && (
          <MorrisStage game={game} names={names} onSettings={() => setSetupOpen(true)} />
        )}
      </PageTemplate>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <SetupPanel onStart={begin} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmSettings}
        onOpenChange={setConfirmSettings}
        title="離開這一局？"
        description="棋盤會清空，回到設定後要重新開始。"
        cancel="繼續比"
        confirm="回到設定"
        onConfirm={() => {
          setConfirmSettings(false);
          setSetupOpen(true);
        }}
      />
      <ConfirmDialog
        open={confirmEnd}
        onOpenChange={setConfirmEnd}
        title="要以和局結束嗎？"
        description="最後的棋盤會保留在結果畫面。"
        cancel="繼續比"
        confirm="結束本局"
        onConfirm={() => {
          setConfirmEnd(false);
          game.endAsDraw();
        }}
      />
    </>
  );
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancel,
  confirm,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancel: string;
  confirm: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{cancel}</Button>
          <Button variant="destructive" onClick={onConfirm}>{confirm}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useGameSounds(
  state: ReturnType<typeof useMorrisGame>["state"],
  enabled: boolean,
) {
  const {
    playCorrectSound,
    playWrongSound,
    playAddSound,
    playBonusSound,
    playCountdownTick,
    playGoSound,
  } = useSound();
  const previousCountdown = useRef<number | null>(null);
  const previousBoard = useRef(state.board);
  const previousResult = useRef(state.result);
  const previousFeedback = useRef({
    red: state.lanes.red.feedback,
    blue: state.lanes.blue.feedback,
  });
  const redFeedback = state.lanes.red.feedback;
  const blueFeedback = state.lanes.blue.feedback;

  useEffect(() => {
    const previous = previousCountdown.current;
    previousCountdown.current = state.countdown;
    if (!enabled || previous === state.countdown) return;
    if (state.countdown !== null) playCountdownTick();
    else if (previous === 1 && state.phase === "quiz") playGoSound();
  }, [enabled, state.countdown, state.phase, playCountdownTick, playGoSound]);

  useEffect(() => {
    if (enabled && redFeedback && redFeedback !== previousFeedback.current.red) {
      if (redFeedback.correct) playCorrectSound();
      else playWrongSound();
    }
    if (enabled && blueFeedback && blueFeedback !== previousFeedback.current.blue) {
      if (blueFeedback.correct) playCorrectSound();
      else playWrongSound();
    }
    previousFeedback.current = { red: redFeedback, blue: blueFeedback };
  }, [
    enabled,
    redFeedback,
    blueFeedback,
    playCorrectSound,
    playWrongSound,
  ]);

  useEffect(() => {
    const changed = previousBoard.current !== state.board;
    previousBoard.current = state.board;
    if (enabled && changed && state.board.some(Boolean)) playAddSound();
  }, [enabled, state.board, playAddSound]);

  useEffect(() => {
    const changed = previousResult.current !== state.result;
    previousResult.current = state.result;
    if (enabled && changed && state.result && state.result !== "draw") playBonusSound();
  }, [enabled, state.result, playBonusSound]);
}
