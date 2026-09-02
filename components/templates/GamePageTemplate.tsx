import { pages, type PageKey, type PageWithKey } from "@/app/pages.config";
import { CircleHelpIcon } from "../atoms/ani-icons/CircleHelpIcon";
import { RefreshCWIcon } from "../atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "../atoms/ani-icons/settings-gear";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../atoms/shadcn/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../molecules/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../atoms/shadcn/tooltip";
import { FullscreenButton } from "../atoms/FullscreenButton";
import { GAME_STAGE_ID, PageTemplate } from "./PageTemplate";

/**
 * 頂列圓鈕的說明泡泡。
 * 包一層 span 當觸發器：這幾顆鈕（動畫 icon、FullscreenButton）沒有把 ref 轉出 DOM 節點，
 * asChild 直接掛在它們身上會定位不到。四顆都已經有 aria-label，讀螢幕器不靠 tooltip。
 */
const Tip = ({
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

  // 透明列上的 ghost 圓鈕：hover 只有一層極淡的 ink，按下縮 0.97 給即時回饋
  const btn =
    "h-9 w-9 rounded-full p-0 hover:bg-ink/[0.06] transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]";

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
      <Sheet>
        <Tip label="設定">
          <SheetTrigger aria-label="設定" className="rounded-full">
            <SettingsGearIcon className={btn} size={20} />
          </SheetTrigger>
        </Tip>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>設定</SheetTitle>
            {settings}
          </SheetHeader>
        </SheetContent>
      </Sheet>
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
    <PageTemplate page={pageInfo} actions={actions}>
      {children}
    </PageTemplate>
  );
};
