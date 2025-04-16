import { RefreshCWIcon } from "../atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "../atoms/ani-icons/settings-gear";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../molecules/sheet";
import { PageTemplate } from "./PageTemplate";

export const GamePageTemplate = ({
  title,
  children,
  settings,
  resetGame,
}: {
  title: string;
  children: React.ReactNode;
  settings: React.ReactNode;
  resetGame: () => void;
}) => {
  return (
    <PageTemplate title={title}>
      <Sheet>
        <SheetTrigger>
          <SettingsGearIcon className="fixed top-16 right-4 h-10 w-10 bg-zinc-100 sm:bg-transparent sm:hover:bg-transparent" />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="text-left">
            <SheetTitle>設定</SheetTitle>
            {settings}
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <RefreshCWIcon
        className="fixed top-4 right-4 h-10 w-10 bg-zinc-100 sm:bg-transparent sm:hover:bg-transparent"
        onClick={resetGame}
      />
      {children}
    </PageTemplate>
  );
};
