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
import { PageTemplate } from "./PageTemplate";

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
    <>
      <RefreshCWIcon
        className={btn}
        size={20}
        aria-label="重新出題"
        onClick={resetGame}
      />
      <Sheet>
        <SheetTrigger aria-label="設定" className="rounded-full">
          <SettingsGearIcon className={btn} size={20} />
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>設定</SheetTitle>
            {settings}
          </SheetHeader>
        </SheetContent>
      </Sheet>
      {tips && (
        <Dialog>
          <DialogTrigger aria-label="提示" className="rounded-full">
            <CircleHelpIcon className={btn} size={20} />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>提示</DialogTitle>
              {tips}
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  return (
    <PageTemplate page={pageInfo} actions={actions}>
      {children}
    </PageTemplate>
  );
};
