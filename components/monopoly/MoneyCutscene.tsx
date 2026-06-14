"use client";

import { AnimatePresence, motion } from "motion/react";
import type { CutsceneEvent, Player } from "@/lib/monopoly/types";
import { PlayerAvatar } from "./Avatar";

function fmt(n: number): string {
  const s = Math.abs(n).toLocaleString();
  return n >= 0 ? `+$${s}` : `−$${s}`;
}

// 單一玩家：頭像 ＋ 名字 ＋ 金額（收綠付紅）
function Party({
  player,
  amount,
  size = 96,
}: {
  player: Player;
  amount: number;
  size?: number;
}) {
  const gain = amount >= 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <motion.span
          className="pointer-events-none absolute rounded-full"
          style={{
            width: size * 2.5,
            height: size * 2.5,
            background: `radial-gradient(circle, ${player.color}99 0%, ${player.color}33 40%, ${player.color}00 70%)`,
            filter: "blur(6px)",
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.85, 1.08, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.04 }}
        />
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 16,
            delay: 0.06,
          }}
        >
          <PlayerAvatar
            character={player.character}
            color={player.color}
            size={size}
            ringWidth={5}
          />
        </motion.div>
      </div>
      <div
        className="max-w-[8rem] truncate text-base font-bold text-white/85"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
      >
        {player.name}
      </div>
      <motion.div
        className="text-3xl font-extrabold tabular-nums"
        style={{
          color: gain ? "#34d399" : "#f87171",
          textShadow: "0 2px 10px rgba(0,0,0,0.55)",
        }}
        initial={{ y: 10, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 18,
          delay: 0.22,
        }}
      >
        {fmt(amount)}
      </motion.div>
    </div>
  );
}

// 過場：暗場聚光燈，沿用回合轉場風格。收租雙方都演，暫停／其餘單人演。
export function MoneyCutscene({
  event,
  players,
}: {
  event: CutsceneEvent | null;
  players: Player[];
}) {
  const byId = (id: string) => players.find((p) => p.id === id);

  let label = "";
  let body: React.ReactNode = null;

  if (event) {
    if (event.kind === "skip") {
      const p = byId(event.playerId);
      label = "監獄 🚔";
      body = p ? (
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex items-center justify-center">
            <motion.span
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 240,
                height: 240,
                background: `radial-gradient(circle, ${p.color}99 0%, ${p.color}33 40%, ${p.color}00 70%)`,
                filter: "blur(6px)",
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.85, 1.08, 1], opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.04 }}
            />
            <motion.div
              className="relative grayscale"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 16,
                delay: 0.06,
              }}
            >
              <PlayerAvatar
                character={p.character}
                color={p.color}
                size={96}
                ringWidth={5}
              />
            </motion.div>
          </div>
          <div
            className="max-w-[8rem] truncate text-base font-bold text-white/85"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {p.name}
          </div>
          <motion.div
            className="text-3xl font-extrabold text-amber-300"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
            initial={{ y: 10, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 18,
              delay: 0.22,
            }}
          >
            暫停一回合
          </motion.div>
        </div>
      ) : null;
    } else if (event.kind === "toll") {
      const payer = byId(event.payerId);
      const owner = byId(event.ownerId);
      label = `付過路費 · ${event.tileName}`;
      body = (
        <div className="flex items-center gap-5">
          {payer && <Party player={payer} amount={-event.amount} size={84} />}
          <motion.div
            className="text-4xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 16,
              delay: 0.16,
            }}
          >
            💸
          </motion.div>
          {owner && <Party player={owner} amount={event.amount} size={84} />}
        </div>
      );
    } else {
      const p = byId(event.playerId);
      const labels: Record<string, string> = {
        passStart: "經過起點 🏁",
        card:
          event.kind === "card"
            ? `${event.deck === "chance" ? "機會" : "命運"}：${event.text}`
            : "",
        buy: `購買 · ${"tileName" in event ? event.tileName : ""}`,
        build: `蓋房 · ${"tileName" in event ? event.tileName : ""}`,
      };
      label = labels[event.kind] ?? "";
      const amt =
        event.kind === "buy" || event.kind === "build"
          ? -event.amount
          : event.amount;
      body = p ? <Party player={p} amount={amt} /> : null;
    }
  }

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key="money-backdrop"
          className="fixed inset-0 z-40 bg-stone-950/55 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      )}
      {event && (
        <motion.div
          key={event.seq}
          className="pointer-events-none fixed inset-x-0 top-[26%] z-50 flex flex-col items-center px-4"
          initial={{ y: -16, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 12, scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        >
          <div
            className="mb-6 max-w-[34rem] text-center text-base font-bold tracking-wide text-white/85"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {label}
          </div>
          {body}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
