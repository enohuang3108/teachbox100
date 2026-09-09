"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  joinAsPlayer,
  myRank,
  sendBuzz,
  useBuzzStore,
} from "@/lib/scoreboard/buzz";
import { useEffect, useState } from "react";

const RANK_LABEL = ["", "第一個", "第二個", "第三個"];

export default function JoinPage() {
  // 房號走 hash 不走 query：不必包 Suspense，也不會被當成兩個不同網址收錄
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const { open, order, connected } = useBuzzStore();
  const rank = joined ? myRank(order) : 0;

  const join = async (c = code, n = name) => {
    const room = c.trim().toUpperCase();
    const who = n.trim();
    if (!room || !who) return;
    setBusy(true);
    localStorage.setItem("buzz-name", who);
    await joinAsPlayer(room, who).finally(() => setBusy(false));
    setJoined(true);
  };

  useEffect(() => {
    const c = location.hash.slice(1).toUpperCase();
    const n = localStorage.getItem("buzz-name") ?? "";
    setCode(c);
    setName(n);
    // 掃過一次之後，重新整理就直接回到搶答畫面 —— 手機斷線時最快的復原方式
    if (c && n) join(c, n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!joined) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-4 p-6">
        <h1 className="text-ink text-2xl font-bold">加入搶答</h1>
        <label className="text-ink-soft flex flex-col gap-1 text-sm">
          房號
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            className="border-ink/10 bg-paper-warm text-ink focus:border-ink/25 rounded-lg border p-3 text-xl tracking-[0.2em] outline-none transition-colors duration-150 ease-out"
          />
        </label>
        <label className="text-ink-soft flex flex-col gap-1 text-sm">
          你的名字
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            enterKeyHint="go"
            onKeyDown={(e) => e.key === "Enter" && join()}
            className="border-ink/10 bg-paper-warm text-ink focus:border-ink/25 rounded-lg border p-3 text-xl outline-none transition-colors duration-150 ease-out"
          />
        </label>
        <Button
          onClick={() => join()}
          disabled={busy || !code.trim() || !name.trim()}
        >
          {busy ? "連線中…" : "加入"}
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col gap-6 p-6">
      <div className="flex items-baseline justify-between">
        <span className="text-ink flex items-center gap-2 text-xl font-bold">
          {/* 綠點＝連著，灰點＝掉了。學生一眼看得出按下去有沒有用 */}
          <span
            className={`size-2.5 rounded-full transition-colors duration-200 ease-out ${
              connected ? "bg-emerald-500" : "bg-ink/25"
            }`}
          />
          {name}
        </span>
        <span className="text-ink-soft text-sm tracking-[0.2em]">{code}</span>
      </div>

      {/* 按鈴：整個下半螢幕都是靶，手機單手也點得到 */}
      <button
        type="button"
        onClick={sendBuzz}
        disabled={!connected || !open || rank > 0}
        className="bg-brand-yellow text-ink flex-1 rounded-3xl text-5xl font-bold shadow-sm transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:opacity-40"
      >
        {rank > 0 ? (RANK_LABEL[rank] ?? `第 ${rank} 個`) : "搶答"}
      </button>

      {connected ? (
        <p className="text-ink-soft text-center text-base leading-[1.75]">
          {rank > 0
            ? "已經按到了，等老師開下一題"
            : open
              ? "現在可以按"
              : "等老師開放搶答"}
        </p>
      ) : (
        /* 斷線通常幾秒內自己接回來；接不回來就重新整理，名字會自動帶回去 */
        <div className="flex flex-col items-center gap-2">
          <p className="text-ink-soft text-center text-base leading-[1.75]">
            正在連上老師…斷線會自動重連，等太久就按下面
          </p>
          <Button variant="outline" onClick={() => location.reload()}>
            重新連線
          </Button>
        </div>
      )}
    </main>
  );
}
