// token 只能在伺服器用：被 client 元件 import 時 build 直接失敗
import "server-only";
import type { ShareUnit } from "@/lib/share/units";
import { Redis } from "@upstash/redis";

// Vercel Marketplace 接的 Upstash 給 KV_*，直接在 Upstash 建的給 UPSTASH_*
const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
  token:
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

const DAY = 60 * 60 * 24;
// 正式站建立後 6 個月過期；本機與 preview 測試用的連結留 30 天就好（共用同一個 Redis）
const TTL = process.env.VERCEL_ENV === "production" ? 183 * DAY : 30 * DAY;
// 快到期時有人打開，就從那次起再留 1 個月
const OPEN_GRACE = 30 * DAY;
const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // 去掉 0O1lI，手抄不會看錯

function toId(bytes: Uint8Array) {
  return Array.from(
    bytes.slice(0, 8),
    (b) => ID_CHARS[b % ID_CHARS.length],
  ).join("");
}

/** 讀出並在剩不到 1 個月時延長到 1 個月；GT 讓剩比較多的不會被縮短 */
async function touch(key: string) {
  const [target, before] = await redis
    .pipeline()
    .get<string>(key)
    .ttl(key)
    .expire(key, OPEN_GRACE, "GT")
    .exec<[string | null, number, number]>();
  return {
    target,
    expiresAt: Date.now() + Math.max(before, OPEN_GRACE) * 1000,
    // 本機 TTL 剛好等於 OPEN_GRACE，每次打開都會多延幾秒；差不到一天不算延長
    extended: OPEN_GRACE - before > DAY,
  };
}

/**
 * id 由內容雜湊而來：同一份設定再按一次分享拿到同一個連結，不佔新的空間。
 * hash 要先由伺服器重新編碼過，不同瀏覽器的 deflate 輸出可能不一樣。
 */
export async function createShortLink(
  unit: ShareUnit,
  hash: string,
): Promise<{ id: string; expiresAt: number }> {
  const value = `${unit}#${hash}`;
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
  const candidates = [toId(digest)];
  // 雜湊撞到別份內容（機率極低）就退回隨機 id
  for (let i = 0; i < 2; i++) {
    candidates.push(toId(crypto.getRandomValues(new Uint8Array(8))));
  }
  for (const id of candidates) {
    const key = `share:${id}`;
    const created = await redis.set(key, value, { ex: TTL, nx: true });
    if (created) return { id, expiresAt: Date.now() + TTL * 1000 };
    const existing = await touch(key);
    if (existing.target === value) return { id, expiresAt: existing.expiresAt };
  }
  throw new Error("short link id collision");
}

export async function resolveShortLink(id: string) {
  const link = await touch(`share:${id}`);
  return link.target ? { ...link, target: link.target } : null;
}

/** 每個 IP 每分鐘最多建 5 個，免費額度不被灌爆（學校共用對外 IP 時是全校共用這 5 次） */
export const RATE_LIMIT = 5;
export async function allowCreate(ip: string): Promise<boolean> {
  const key = `share-rate:${ip}`;
  // 同一個請求送出：分成兩次的話，INCR 成功、EXPIRE 失敗會讓這個 IP 永遠被擋
  const [count] = await redis
    .pipeline()
    .incr(key)
    .expire(key, 60, "NX")
    .exec<[number, number]>();
  return count <= RATE_LIMIT;
}
