import { beforeEach, describe, expect, it, vi } from "vitest";
// vi.mock 會被提到檔案最上面，這個 import 拿到的是接上假 Redis 的版本
import {
  allowCreate,
  createShortLink,
  RATE_LIMIT,
  resolveShortLink,
} from "./short-link";

vi.mock("server-only", () => ({}));

// 記憶體版 Redis：只實作 short-link.ts 用到的指令，TTL 以秒數直接存，不跑真時間
const store = new Map<string, { value: unknown; ttl: number }>();
vi.mock("@upstash/redis", () => {
  const ops = {
    get: (k: string) => store.get(k)?.value ?? null,
    ttl: (k: string) => store.get(k)?.ttl ?? -2,
    incr: (k: string) => {
      const e = store.get(k) ?? { value: 0, ttl: -1 };
      e.value = Number(e.value) + 1;
      store.set(k, e);
      return e.value;
    },
    expire: (k: string, sec: number, opt?: string) => {
      const e = store.get(k);
      if (!e) return 0;
      if (opt === "GT" && !(e.ttl === -1 || sec > e.ttl)) return 0;
      if (opt === "NX" && e.ttl !== -1) return 0;
      e.ttl = sec;
      return 1;
    },
  };
  class Redis {
    async set(k: string, value: unknown, o: { ex: number; nx?: boolean }) {
      if (o.nx && store.has(k)) return null;
      store.set(k, { value, ttl: o.ex });
      return "OK";
    }
    pipeline() {
      const queue: (() => unknown)[] = [];
      const p = {
        get: (k: string) => (queue.push(() => ops.get(k)), p),
        ttl: (k: string) => (queue.push(() => ops.ttl(k)), p),
        incr: (k: string) => (queue.push(() => ops.incr(k)), p),
        expire: (k: string, s: number, o?: string) => (
          queue.push(() => ops.expire(k, s, o)),
          p
        ),
        exec: async () => queue.map((f) => f()),
      };
      return p;
    }
  }
  return { Redis };
});

const DAY = 60 * 60 * 24;

beforeEach(() => store.clear());

describe("短連結", () => {
  it("同一份內容拿到同一個 id，內容不同就不同", async () => {
    const a1 = await createShortLink("monopoly", "setup=AAA");
    const a2 = await createShortLink("monopoly", "setup=AAA");
    const b = await createShortLink("monopoly", "setup=BBB");
    expect(a2.id).toBe(a1.id);
    expect(b.id).not.toBe(a1.id);
    expect(store.size).toBe(2);
  });

  it("雜湊 id 被別份內容佔走時換隨機 id，不覆蓋對方", async () => {
    const { id } = await createShortLink("monopoly", "setup=AAA");
    store.set(`share:${id}`, { value: "monopoly#setup=OTHER", ttl: 30 * DAY });
    const again = await createShortLink("monopoly", "setup=AAA");
    expect(again.id).not.toBe(id);
    expect(store.get(`share:${id}`)?.value).toBe("monopoly#setup=OTHER");
  });

  it("打開不存在的連結回 null", async () => {
    expect(await resolveShortLink("ABCDEFGH")).toBeNull();
  });

  it("剩很多天時打開不延長、不縮短", async () => {
    const { id } = await createShortLink("monopoly", "setup=AAA");
    store.get(`share:${id}`)!.ttl = 100 * DAY;
    const link = await resolveShortLink(id);
    expect(link?.target).toBe("monopoly#setup=AAA");
    expect(link?.extended).toBe(false);
    expect(store.get(`share:${id}`)?.ttl).toBe(100 * DAY);
  });

  it("剩不到一個月時打開延長到 30 天", async () => {
    const { id } = await createShortLink("monopoly", "setup=AAA");
    store.get(`share:${id}`)!.ttl = 3600;
    const link = await resolveShortLink(id);
    expect(link?.extended).toBe(true);
    expect(store.get(`share:${id}`)?.ttl).toBe(30 * DAY);
  });

  it("本機 TTL 剛好 30 天時，打開不算延長", async () => {
    const { id } = await createShortLink("monopoly", "setup=AAA");
    store.get(`share:${id}`)!.ttl = 30 * DAY - 5;
    expect((await resolveShortLink(id))?.extended).toBe(false);
  });
});

describe("每分鐘建立次數", () => {
  it(`第 ${RATE_LIMIT + 1} 次起擋下，計數器 60 秒後清掉`, async () => {
    const results = [];
    for (let i = 0; i <= RATE_LIMIT; i++)
      results.push(await allowCreate("1.2.3.4"));
    expect(results).toEqual([...Array(RATE_LIMIT).fill(true), false]);
    expect(store.get("share-rate:1.2.3.4")?.ttl).toBe(60);
    expect(await allowCreate("5.6.7.8")).toBe(true);
  });
});
