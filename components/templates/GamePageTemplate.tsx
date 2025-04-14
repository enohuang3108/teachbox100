import { RefreshCWIcon } from "../atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "../atoms/ani-icons/settings-gear";
import { Background } from "../atoms/Background";
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <Background />
      <Sheet>
        <SheetTrigger>
          <SettingsGearIcon className="fixed top-16 right-4 w-10 h-10 hover:bg-transparent" />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="text-left">
            <SheetTitle>設定</SheetTitle>
            {settings}
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <RefreshCWIcon
        className="fixed top-4 right-4 w-10 h-10 hover:bg-transparent"
        onClick={resetGame}
      />
      <div className="w-full max-w-4xl mx-auto">
        <div className="w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            {title}
          </h1>
        </div>
      </div>
      <div className="w-full max-w-4xl mx-auto">
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
};
