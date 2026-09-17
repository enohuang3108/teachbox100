/**
 * 分享連結的共用層：各單元把設定寫成純文字（不用 JSON：欄位名與引號在題庫裡佔掉約三成），
 * 這裡負責 deflate-raw → base64url，放在 `#setup=` 後面。
 *
 * 文字格式慣例：記錄以 RS 分隔、欄位以 US 分隔、欄位內清單以 GS 分隔；
 * 第一筆記錄的第一欄是版本號，改格式就加版本 —— 舊連結還在別人手上。
 */

export const SHARE_KEY = "setup=";
export const RS = "\x1e";
export const US = "\x1f";
export const GS = "\x1d";

export interface ShareCodec<T> {
  /** 回傳放在 # 後面的字串（含 setup= 前綴） */
  encode: (setup: T) => Promise<string>;
  /** 連結是別人給的，壞掉或格式不對一律回 null，不讓它弄壞老師本機的設定 */
  decode: (hash: string) => Promise<T | null>;
}

// 使用者文字裡剛好有分隔字元會切錯欄位，先拿掉（正常輸入不會有這些控制字元）
// oxlint-disable-next-line no-control-regex -- 要比對的就是分隔用的控制字元
export const clean = (s: string) => s.replace(/[\x1d-\x1f]/g, "");

export function fail(): never {
  throw new Error("bad share payload");
}

export function num(s: string | undefined): number {
  const n = Number(s);
  return s === undefined || s === "" || !Number.isFinite(n) ? fail() : n;
}

export const flag = (b: boolean) => (b ? "1" : "0");
export const readFlag = (s: string | undefined) =>
  s === "1" ? true : s === "0" ? false : fail();

/** 切成記錄與欄位，並檢查第一欄的版本號 */
export function rows(text: string, version: string): string[][] {
  const all = text.split(RS).map((r) => r.split(US));
  if (all[0][0] !== version) fail();
  return all;
}

async function pipe(
  bytes: Uint8Array<ArrayBuffer>,
  stream: GenericTransformStream,
) {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export function defineCodec<T>(
  serialize: (setup: T) => string,
  parse: (text: string) => T,
): ShareCodec<T> {
  return {
    async encode(setup) {
      const text = new TextEncoder().encode(serialize(setup));
      const packed = await pipe(text, new CompressionStream("deflate-raw"));
      // 不用 fromCharCode(...packed)：題庫大時展開參數會爆 call stack
      let bin = "";
      for (const b of packed) bin += String.fromCharCode(b);
      const b64 = btoa(bin);
      return (
        SHARE_KEY +
        b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
      );
    },
    async decode(hash) {
      const raw = hash.replace(/^#/, "");
      if (!raw.startsWith(SHARE_KEY)) return null;
      try {
        const b64 = raw
          .slice(SHARE_KEY.length)
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        const packed = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const text = await pipe(packed, new DecompressionStream("deflate-raw"));
        return parse(new TextDecoder().decode(text));
      } catch {
        return null;
      }
    },
  };
}
