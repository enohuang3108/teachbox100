// 翻翻配對的規則：牌組驗證、洗牌建盤、配對判定。UI 只負責畫與計時。
import type { Rng } from "@/lib/monopoly/rng";

export const MIN_GROUPS = 2;
export const MAX_GROUPS = 15;
export const MAX_FACE_LENGTH = 20;
export const PREVIEW_MS = 2000;
export const WRONG_PAIR_MS = 900;

/** 配對組：一個穩定的配對識別、兩張卡面、是否同卡面 */
export interface PairGroup {
  id: string;
  faces: [string, string];
  sameFace: boolean;
}

/** 盤面上的一張牌 */
export interface Card {
  id: string;
  groupId: string;
  face: string;
}

export interface DeckValidation {
  ok: boolean;
  /** 整副牌組的問題（數量不對） */
  deck?: string;
  /** 每組的問題，index 對應 deck，沒問題是 undefined */
  groups: (string | undefined)[];
}

export const STARTER_DECK: PairGroup[] = [
  { id: "starter-cat", faces: ["貓", "cat"], sameFace: false },
  { id: "starter-dog", faces: ["狗", "dog"], sameFace: false },
  { id: "starter-sun", faces: ["太陽", "sun"], sameFace: false },
  { id: "starter-moon", faces: ["月亮", "moon"], sameFace: false },
];

export const newGroup = (): PairGroup => ({
  id: crypto.randomUUID(),
  faces: ["", ""],
  sameFace: false,
});

/** 卡面可以是文字或圖片；圖片存成 data URL（SetupPanel 已先縮到縮圖大小） */
export const isImageFace = (face: string): boolean => face.startsWith("data:image/");

/** 錯誤訊息用：圖片的 data URL 不能直接印出來 */
const faceLabel = (face: string) => (isImageFace(face) ? "同一張圖片" : `「${face}」`);

/** 同卡面的組別第二張永遠跟著第一張 */
export const effectiveFaces = (g: PairGroup): [string, string] =>
  g.sameFace ? [g.faces[0], g.faces[0]] : g.faces;

export function validateDeck(deck: PairGroup[]): DeckValidation {
  const result: DeckValidation = { ok: true, groups: deck.map(() => undefined) };
  if (deck.length < MIN_GROUPS || deck.length > MAX_GROUPS) {
    result.deck = `配對組要介於 ${MIN_GROUPS} 到 ${MAX_GROUPS} 組`;
    result.ok = false;
  }

  // 卡面文字 → 第一次出現的組別 index；同卡面組自己的兩張不算重複
  const seen = new Map<string, number>();
  deck.forEach((g, i) => {
    const faces = effectiveFaces(g).map((f) => f.trim());
    const own = g.sameFace ? [faces[0]] : faces;
    for (const face of own) {
      if (face === "") return setError(i, "卡面不能空白");
      if (!isImageFace(face) && Array.from(face).length > MAX_FACE_LENGTH)
        return setError(i, `卡面最多 ${MAX_FACE_LENGTH} 個字`);
      const at = seen.get(face);
      if (at !== undefined) {
        return setError(
          i,
          at === i ? "兩張卡面相同，請改成「同卡面」" : `${faceLabel(face)}已在配對 ${at + 1} 用過`,
        );
      }
      seen.set(face, i);
    }
  });

  function setError(i: number, msg: string) {
    result.groups[i] = msg;
    result.ok = false;
  }
  return result;
}

/** 每組恰好兩張牌，保留配對識別，再用注入的亂數洗牌 */
export function buildBoard(deck: PairGroup[], rng: Rng): Card[] {
  const cards = deck.flatMap((g) =>
    effectiveFaces(g).map((face, i) => ({ id: `${g.id}:${i}`, groupId: g.id, face })),
  );
  return shuffle(cards, rng);
}

/** 只比配對識別，卡面文字不參與；同一張牌不會跟自己配 */
export const isMatch = (a: Card, b: Card): boolean =>
  a.id !== b.id && a.groupId === b.groupId;

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
