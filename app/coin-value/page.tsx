import { Background } from "@/components/atoms/Background";
import CoinGame from "@/components/organisms/coin-game";

export default function CoinGamePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <Background />
      <div className="w-full max-w-4xl mx-auto">
        <CoinGame />
      </div>
    </main>
  );
}
