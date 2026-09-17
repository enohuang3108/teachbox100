import { clean, defineCodec, fail, GS, num, RS, US } from "@/lib/share/codec";
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

const optionalFlag = (b: boolean | undefined) =>
  b === undefined ? "" : b ? "1" : "0";
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
    optionalFlag(s.passStartQuiz),
    s.passStartQuizBonus ?? "",
    optionalFlag(s.differentiated),
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

export const monopolyShare = defineCodec(serialize, parse);
export const { encode: encodeSetup, decode: decodeSetup } = monopolyShare;
