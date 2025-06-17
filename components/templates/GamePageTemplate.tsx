import { pages, type PageWithKey } from "@/app/pages.config";
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
  page: keyof typeof pages;
  children: React.ReactNode;
  settings: React.ReactNode[];
  resetGame: () => void;
  tips?: React.ReactNode;
}) => {
  const pageInfo: PageWithKey = { ...pages[page], key: page };

  return (
    <PageTemplate page={pageInfo}>
      <RefreshCWIcon
        className="fixed top-4 right-4 h-10 w-10 bg-zinc-100 sm:bg-transparent sm:hover:bg-transparent"
        onClick={resetGame}
      />
      <Sheet>
        <SheetTrigger>
          <SettingsGearIcon className="fixed top-16 right-4 h-10 w-10 bg-zinc-100 sm:bg-transparent sm:hover:bg-transparent" />
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
          <DialogTrigger>
            <CircleHelpIcon className="fixed top-28 right-4 h-10 w-10 bg-zinc-100 sm:bg-transparent sm:hover:bg-transparent" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>提示</DialogTitle>
              {tips}
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
      {children}
    </PageTemplate>
  );
};
