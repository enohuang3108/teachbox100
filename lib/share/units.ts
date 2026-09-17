import { pages } from "@/app/pages.config";
import { gachaShare } from "@/lib/gacha/share";
import { ichibanShare } from "@/lib/ichiban/share";
import { multiplicationShare } from "@/lib/math/share";
import { memoryShare } from "@/lib/memory/share";
import { monopolyShare } from "@/lib/monopoly/share";
import { scoreboardShare } from "@/lib/scoreboard/share";
import { wheelShare } from "@/lib/wheel/share";
import type { ShareCodec } from "./codec";

/**
 * 有分享連結的單元。key 同 `pages.config`：短連結存 `<key>#<hash>`，打開時導回 `pages[key].path`。
 * key 一旦有連結在外面就不能改名。
 */
export const SHARE_CODECS = {
  monopoly: monopolyShare,
  wheel: wheelShare,
  gacha: gachaShare,
  ichiban: ichibanShare,
  memory: memoryShare,
  multiplication: multiplicationShare,
  scoreboard: scoreboardShare,
};

export type ShareUnit = keyof typeof SHARE_CODECS;
export type SetupOf<K extends ShareUnit> =
  (typeof SHARE_CODECS)[K] extends ShareCodec<infer T> ? T : never;

export const isShareUnit = (unit: unknown): unit is ShareUnit =>
  typeof unit === "string" && Object.hasOwn(SHARE_CODECS, unit);

export const sharePath = (unit: ShareUnit) => pages[unit].path;

/** 各單元的 codec 型別不同，呼叫端只知道 unit 字串時走這兩個 */
export const encodeFor = <K extends ShareUnit>(unit: K, setup: SetupOf<K>) =>
  (SHARE_CODECS[unit] as unknown as ShareCodec<SetupOf<K>>).encode(setup);
export const decodeFor = <K extends ShareUnit>(unit: K, hash: string) =>
  (SHARE_CODECS[unit] as unknown as ShareCodec<SetupOf<K>>).decode(hash);
