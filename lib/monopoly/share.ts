import { clean, defineCodec, fail, num, RS, US } from "@/lib/share/codec";
import {
  diffCode,
  questionFrom,
  questionRow,
  readDiff,
} from "@/lib/questions/share";
import {
  BONUS_KEYS,
  type BonusSettings,
  type EndCondition,
  type GameSettings,
  type PlayerInput,
  type Question,
} from "./types";

/** questions 為 null 代表用預設題庫，連結就不用塞整份題目 */
export interface SharedSetup {
  settings: GameSettings;
  players: PlayerInput[];
  questions: Question[] | null;
  /** 題庫名稱；收到的人在清單裡看得到選了哪份 */
  title?: string;
}

const VERSION = "1";

const END_CODE: Record<EndCondition["type"], string> = {
  time: "t",
  moneyGoal: "m",
  lastOneStanding: "l",
  laps: "p",
};

const optionalFlag = (b: boolean | undefined) =>
  b === undefined ? "" : b ? "1" : "0";

function serialize({ settings: s, players, questions, title }: SharedSetup): string {
  const ec = s.endCondition;
  const bonus = bonusCode(s.bonuses);
  const endValue =
    ec.type === "time"
      ? ec.minutes
      : ec.type === "moneyGoal"
        ? ec.amount
        : ec.type === "laps"
          ? ec.count
          : "";
  const head = [
    VERSION,
    s.playerCount,
    s.startingMoney,
    s.diceCount,
    s.passStartBonus,
    optionalFlag(s.passStartQuiz),
    s.passStartQuizBonus ?? "",
    optionalFlag(s.differentiated),
    END_CODE[ec.type],
    endValue,
    players.length,
    questions ? "c" : "d",
    // 第 13 欄題庫名稱、第 14 欄加分；沒有加分時維持舊格式，舊連結編出來一模一樣
    ...(bonus
      ? [questions && title ? clean(title) : "", bonus]
      : questions && title
        ? [clean(title)]
        : []),
  ].join(US);
  const playerRows = players.map((p) =>
    [clean(p.name), p.color, p.character, diffCode(p.difficulty)].join(US),
  );
  const questionRows = (questions ?? []).map(questionRow);
  return [head, ...playerRows, ...questionRows].join(RS);
}

// 第 14 欄：六項加分依 BONUS_KEYS 順序以逗號串起，沒開的留空；沒開任何一項就不出這欄
function bonusCode(b: BonusSettings | undefined): string {
  if (!b || BONUS_KEYS.every((k) => b[k] === undefined)) return "";
  return BONUS_KEYS.map((k) => b[k] ?? "").join(",");
}

function readBonus(code: string | undefined): BonusSettings | undefined {
  if (!code) return undefined;
  const parts = code.split(",");
  const out: BonusSettings = {};
  BONUS_KEYS.forEach((k, i) => {
    if (parts[i]) out[k] = num(parts[i]);
  });
  return out;
}

const optFlag = (s: string) => (s === "" ? undefined : s === "1");
const fromCode = <K extends string>(codes: Record<K, string>, c: string) =>
  (Object.keys(codes) as K[]).find((k) => codes[k] === c) ?? fail();

function parseEnd(code: string, value: string): EndCondition {
  switch (fromCode(END_CODE, code)) {
    case "time":
      return { type: "time", minutes: num(value) };
    case "moneyGoal":
      return { type: "moneyGoal", amount: num(value) };
    case "laps":
      return { type: "laps", count: num(value) };
    case "lastOneStanding":
      return { type: "lastOneStanding" };
  }
}

function parse(text: string): SharedSetup {
  const [head, ...rows] = text.split(RS);
  const h = head.split(US);
  if (h[0] !== VERSION) fail();
  const diceCount = num(h[3]);
  if (diceCount !== 1 && diceCount !== 2) fail();
  const settings: GameSettings = {
    playerCount: num(h[1]),
    startingMoney: num(h[2]),
    diceCount,
    passStartBonus: num(h[4]),
    passStartQuiz: optFlag(h[5]),
    passStartQuizBonus: h[6] === "" ? undefined : num(h[6]),
    differentiated: optFlag(h[7]),
    endCondition: parseEnd(h[8], h[9]),
    bonuses: readBonus(h[13]),
  };
  // undefined 的欄位直接拿掉，跟老師本機 persist 的形狀一致
  for (const k of Object.keys(settings) as (keyof GameSettings)[]) {
    if (settings[k] === undefined) delete settings[k];
  }

  const playerCount = num(h[10]);
  if (rows.length < playerCount) fail();
  const players = rows.slice(0, playerCount).map((r): PlayerInput => {
    const [name, color, character, d] = r.split(US);
    const difficulty = readDiff(d);
    return { name, color, character, ...(difficulty && { difficulty }) };
  });

  if (h[11] === "d") return { settings, players, questions: null };
  const questions = rows.slice(playerCount).map(questionFrom);
  // 第 13 欄題庫名稱是後來加的，舊連結沒有
  return { settings, players, questions, ...(h[12] ? { title: h[12] } : {}) };
}

export const monopolyShare = defineCodec(serialize, parse);
export const { encode: encodeSetup, decode: decodeSetup } = monopolyShare;
