#!/usr/bin/env node
/**
 * 測 nostr relay 收不收配對訊息。lib/scoreboard/buzz.ts 的 RELAYS 連不上時跑這支換一批。
 *
 *   node scripts/probe-relays.mjs                         # 測目前用的那幾台
 *   node scripts/probe-relays.mjs nos.lol relay.xxx.com   # 測候選的
 *
 * 測的是「寫得進去」不是「連得上」：好幾台 relay 連線與查詢都正常，
 * 送 event 才回 restricted（要付費）或 blocked（不收 ephemeral kind），
 * 而 trystero 配對正是在送 event。用 trystero 自己的 createEvent 產生
 * 一模一樣的訊息去問，回 OK true 才算數。
 */
process.on("unhandledRejection", () => {});

const DEFAULT = [
  "nostr-01.yakihonne.com",
  "bucket.coracle.social",
  "purplerelay.com",
  "nos.lol",
  "relay.snort.social",
  "relay.primal.net",
];

const TIMEOUT_MS = 10_000;

const { createEvent } = await import("trystero/nostr");
// 隨機 topic：不會跟正在上課的房間撞在一起
const event = await createEvent("probe" + Math.random().toString(36).slice(2, 10), "probe");

const probe = (host) =>
  new Promise((resolve) => {
    const startedAt = Date.now();
    let ws;
    let settled = false;
    const done = (status) => {
      if (settled) return;
      settled = true;
      resolve({ host, status, ms: Date.now() - startedAt });
      try {
        ws?.close();
      } catch {}
    };
    setTimeout(() => done("TIMEOUT"), TIMEOUT_MS);
    try {
      ws = new WebSocket("wss://" + host);
    } catch {
      return done("THROW");
    }
    ws.onopen = () => ws.send(event);
    ws.onmessage = (e) => {
      const msg = JSON.parse(String(e.data));
      if (msg[0] === "OK")
        done(msg[2] ? "OK" : "拒收: " + String(msg[3]).slice(0, 48));
      else if (msg[0] === "NOTICE") done("拒收: " + String(msg[1]).slice(0, 48));
    };
    ws.onerror = () => done("連不上");
    ws.onclose = () => done("被關閉");
  });

const hosts = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;
const results = await Promise.all(hosts.map(probe));
for (const r of results.sort((a, b) => a.ms - b.ms))
  console.log(r.status.padEnd(52), String(r.ms).padStart(5) + "ms", r.host);

const ok = results.filter((r) => r.status === "OK").length;
console.log(`\n${ok}/${hosts.length} 可用`);
process.exit(ok ? 0 : 1);
