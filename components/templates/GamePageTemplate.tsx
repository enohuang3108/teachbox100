import { pages, type PageKey, type PageWithKey } from "@/app/pages.config";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { CircleHelpIcon } from "../atoms/ani-icons/CircleHelpIcon";
import { RefreshCWIcon } from "../atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "../atoms/ani-icons/settings-gear";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../atoms/shadcn/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../atoms/shadcn/tooltip";
import { FullscreenButton } from "../atoms/FullscreenButton";
import { StepSetup } from "../organisms/StepSetup";
import { GAME_STAGE_ID, PageTemplate } from "./PageTemplate";

/**
 * 頂列圓鈕的說明泡泡。
 * 包一層 span 當觸發器：這幾顆鈕（動畫 icon、FullscreenButton）沒有把 ref 轉出 DOM 節點，
 * asChild 直接掛在它們身上會定位不到。四顆都已經有 aria-label，讀螢幕器不靠 tooltip。
 */
export const Tip = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="inline-flex">{children}</span>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

// 透明列上的 ghost 圓鈕：hover 只有一層極淡的 ink，按下縮 0.97 給即時回饋
export const ACTION_BTN =
  "h-9 w-9 rounded-full p-0 hover:bg-ink/[0.06] transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]";

export const GamePageTemplate = ({
  page,
  children,
  settings,
  resetGame,
  tips,
}: {
  page: PageKey;
  children: React.ReactNode;
  settings: React.ReactNode[];
  resetGame: () => void;
  tips?: React.ReactNode;
}) => {
  const pageInfo: PageWithKey = { ...pages[page], key: page };

  const btn = ACTION_BTN;
  // 介紹頁 →（開始練習）設定 →（開始練習）出題；頂列的設定鈕再打開同一個對話框
  const [entered, setEntered] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

  const actions = (
    // delayDuration：第一顆要等一下才跳，避免滑過去就一堆泡泡。
    // skipDelayDuration：關掉之後這段時間內移到隔壁鈕會立刻顯示，整排感覺更快。
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="重新出題">
        <RefreshCWIcon
          className={btn}
          size={20}
          aria-label="重新出題"
          onClick={resetGame}
        />
      </Tip>
      <Tip label="設定">
        <SettingsGearIcon
          className={btn}
          size={20}
          aria-label="設定"
          onClick={() => setSetupOpen(true)}
        />
      </Tip>
      {tips && (
        <Dialog>
          <Tip label="提示">
            <DialogTrigger aria-label="提示" className="rounded-full">
              <CircleHelpIcon className={btn} size={20} />
            </DialogTrigger>
          </Tip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>提示</DialogTitle>
              {tips}
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
      {/* 放最後一顆：視訊播放器、編輯器都把全螢幕放在最右邊 */}
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={btn} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <>
      <PageTemplate
        page={pageInfo}
        actions={actions}
        landing={{
          startLabel: "開始練習",
          onStart: () => setSetupOpen(true),
          entered,
        }}
      >
        {children}
      </PageTemplate>

      {/* 放在 PageTemplate 外面：介紹頁階段 children 不渲染，設定要在那時就能開 */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <StepSetup
            title={`${pageInfo.title}設定`}
            startLabel="開始練習"
            onStart={() => {
              resetGame();
              setSetupOpen(false);
              setEntered(true);
            }}
            steps={[
              {
                key: "rules",
                label: "出題",
                icon: SlidersHorizontal,
                summary: "練習中也能再改",
                content: (
                  <section className="space-y-5">
                    <header>
                      <h3 className="text-h3 text-ink">怎麼出題？</h3>
                      <DialogDescription className="mt-1">
                        練習中按右上角的設定也能再改。
                      </DialogDescription>
                    </header>
                    <div className="flex flex-col gap-6">{settings}</div>
                  </section>
                ),
              },
            ]}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
