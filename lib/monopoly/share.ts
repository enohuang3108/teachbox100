import {
  DIFFICULTIES,
  type Difficulty,
  type EndCondition,
  type GameSettings,
  type PlayerInput,
  type Question,
  type QuestionType,
} from "./types";

/** questions 為 null 代表用預設題庫，連結就不用塞整份題目 */
export interface SharedSetup {
  settings: GameSettings;
  players: PlayerInput[];
  questions: Question[] | null;
}

// 放 hash 不放 query：不會送到伺服器，也沒有 URL 長度上限的問題
export const SHARE_KEY = "setup=";

// 不用 JSON：欄位名與引號在 40 題的題庫裡佔掉約三成。
// 記錄以 RS 分隔、欄位以 US 分隔、清單以 GS 分隔；第一筆開頭是版本號，改格式就加版本
const RS = "\x1e";
const US = "\x1f";
const GS = "\x1d";
const VERSION = "1";

const TYPE_CODE: Record<QuestionType, string> = {
  choice: "c",
  boolean: "b",
  short: "s",
};
const END_CODE: Record<EndCondition["type"], string> = {
  time: "t",
  moneyGoal: "m",
  lastOneStanding: "l",
  laps: "p",
};

// 使用者文字裡剛好有分隔字元會切錯欄位，先拿掉（Excel 題目不會有這些控制字元）
// oxlint-disable-next-line no-control-regex -- 要比對的就是分隔用的控制字元
const clean = (s: string) => s.replace(/[\x1d-\x1f]/g, "");
const flag = (b: boolean | undefined) => (b === undefined ? "" : b ? "1" : "0");
const diff = (d: Difficulty | undefined) => (d ? d[0] : "");

function serialize({ settings: s, players, questions }: SharedSetup): string {
  const ec = s.endCondition;
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
    flag(s.passStartQuiz),
    s.passStartQuizBonus ?? "",
    flag(s.differentiated),
    END_CODE[ec.type],
    endValue,
    players.length,
    questions ? "c" : "d",
  ].join(US);
  const playerRows = players.map((p) =>
    [clean(p.name), p.color, p.character, diff(p.difficulty)].join(US),
  );
  const questionRows = (questions ?? []).map((q) =>
    [
      TYPE_CODE[q.type],
      clean(q.text),
      (q.options ?? []).map(clean).join(GS),
      // 選擇題存選項索引，不重複存一份答案文字
      q.options ? q.options.indexOf(q.answer) : clean(q.answer),
      clean(q.explanation ?? ""),
      diff(q.difficulty),
    ].join(US),
  );
  return [head, ...playerRows, ...questionRows].join(RS);
}

function fail(): never {
  throw new Error("bad share payload");
}
function num(s: string | undefined): number {
  const n = Number(s);
  return s === undefined || s === "" || !Number.isFinite(n) ? fail() : n;
}
const optFlag = (s: string) => (s === "" ? undefined : s === "1");
const optDiff = (s: string | undefined) =>
  s ? DIFFICULTIES.find((d) => d[0] === s) : undefined;
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
  };
  // undefined 的欄位直接拿掉，跟老師本機 persist 的形狀一致
  for (const k of Object.keys(settings) as (keyof GameSettings)[]) {
    if (settings[k] === undefined) delete settings[k];
  }

  const playerCount = num(h[10]);
  if (rows.length < playerCount) fail();
  const players = rows.slice(0, playerCount).map((r): PlayerInput => {
    const [name, color, character, d] = r.split(US);
    const difficulty = optDiff(d);
    return { name, color, character, ...(difficulty && { difficulty }) };
  });

  if (h[11] === "d") return { settings, players, questions: null };
  const questions = rows.slice(playerCount).map((r, i): Question => {
    const [t, qText, opts, answer, explanation, d] = r.split(US);
    const type = fromCode(TYPE_CODE, t);
    if (!qText) fail();
    const options = type === "choice" ? opts.split(GS) : undefined;
    const difficulty = optDiff(d);
    return {
      id: `q${i}`,
      type,
      text: qText,
      ...(options && { options }),
      answer: options ? (options[num(answer)] ?? fail()) : answer,
      ...(explanation && { explanation }),
      ...(difficulty && { difficulty }),
    };
  });
  return { settings, players, questions };
}

async function pipe(
  bytes: Uint8Array<ArrayBuffer>,
  stream: GenericTransformStream,
) {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

/** 回傳放在 # 後面的字串（含 setup= 前綴） */
export async function encodeSetup(setup: SharedSetup): Promise<string> {
  const text = new TextEncoder().encode(serialize(setup));
  const packed = await pipe(text, new CompressionStream("deflate-raw"));
  // 不用 fromCharCode(...packed)：題庫大時展開參數會爆 call stack
  let bin = "";
  for (const b of packed) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return (
    SHARE_KEY + b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  );
}

/** 連結是別人給的，壞掉或格式不對一律回 null，不讓它弄壞老師本機的設定 */
export async function decodeSetup(hash: string): Promise<SharedSetup | null> {
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
}
