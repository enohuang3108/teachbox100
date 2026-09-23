"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { encodeNumber, isValidGuess, nextRange } from "@/lib/morse/game";
import { useState } from "react";

function randomSecret() {
  return Math.floor(Math.random() * 100) + 1;
}

export function MorseGame() {
  const [secret, setSecret] = useState(randomSecret);
  const [guess, setGuess] = useState("");
  const [range, setRange] = useState({ low: 1, high: 100 });
  const [turn, setTurn] = useState(1);
  const [message, setMessage] = useState("第一位學生先來猜！");
  const [won, setWon] = useState(false);

  const submit = () => {
    const value = Number(guess);
    if (!isValidGuess(value) || value < range.low || value > range.high) {
      setMessage(`請猜 ${range.low} 到 ${range.high} 之間的整數。`);
      return;
    }
    if (value === secret) {
      setWon(true);
      setMessage(`答中了！第 ${turn} 位學生找到了答案。`);
      return;
    }
    const next = nextRange(value, secret, range);
    setRange(next);
    setTurn((current) => current + 1);
    setGuess("");
    setMessage(`答錯了，是 ${next.low} 到 ${next.high} 之間，換下一位學生。`);
  };

  const restart = () => {
    setSecret(randomSecret());
    setGuess("");
    setRange({ low: 1, high: 100 });
    setTurn(1);
    setWon(false);
    setMessage("第一位學生先來猜！");
  };

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 text-center">
      <div className="rounded-3xl border-2 border-ink/10 bg-card px-8 py-7 shadow-sm">
        <p className="text-caption text-muted-foreground">請解讀這串摩斯密碼，猜出 1–100 的數字</p>
        <p aria-label="摩斯密碼" className="mt-5 font-mono text-[clamp(2.2rem,9vw,5rem)] font-bold tracking-[0.12em] text-foreground">
          {encodeNumber(secret)}
        </p>
      </div>
      <p aria-live="polite" className="text-body-lg font-bold text-foreground">{message}</p>
      <p className="text-caption text-muted-foreground">目前範圍：{range.low} 到 {range.high}・第 {turn} 位學生</p>
      {!won ? (
        <form className="flex w-full max-w-md gap-3" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <label className="sr-only" htmlFor="morse-guess">猜一個數字</label>
          <input id="morse-guess" type="number" min={range.low} max={range.high} value={guess} onChange={(event) => setGuess(event.target.value)} className="min-w-0 flex-1 rounded-2xl border-2 border-border bg-card px-5 text-center text-3xl font-bold text-foreground outline-none focus:ring-2 focus:ring-ring" placeholder="輸入數字" autoFocus />
          <Button type="submit" size="lg" className="px-7">猜！</Button>
        </form>
      ) : (
        <Button size="lg" onClick={restart}>再玩一次</Button>
      )}
    </section>
  );
}
