import { RefreshCWIcon } from "../atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "../atoms/ani-icons/settings-gear";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../molecules/sheet";

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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-14 md:p-8 md:pt-4">
      <Sheet>
        <SheetTrigger>
          <SettingsGearIcon className="fixed top-16 right-4 h-10 w-10 hover:bg-transparent" />
        </SheetTrigger>
        <SheetContent className="bg-background">
          <SheetHeader className="text-left">
            <SheetTitle>設定</SheetTitle>
            {settings}
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <RefreshCWIcon
        className="fixed top-4 right-4 h-10 w-10 hover:bg-transparent"
        onClick={resetGame}
      />
      <div className="mx-auto w-full max-w-4xl">
        <div className="w-full">
          <h1 className="mb-8 text-4xl font-bold md:text-5xl lg:text-6xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="mx-auto w-full max-w-4xl">
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
};
