import { Background } from "@/components/atoms/Background";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <Background />
      <div className="w-full max-w-4xl mx-auto text-center">
        <Link
          href="/coin-value"
          className="text-blue-600 hover:text-blue-800 text-xl font-medium"
        >
          Go to Coin Value →
        </Link>
      </div>
    </main>
  );
}
