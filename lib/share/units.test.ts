import { describe, expect, it } from "vitest";
import { STARTER_DECK } from "@/lib/memory/game";
import { defaultIchibanPrizes } from "@/lib/ichiban/prizes";
import { DEFAULT_SETTINGS } from "@/lib/monopoly/types";
import { decodeFor, encodeFor, type SetupOf, type ShareUnit } from "./units";

const samples: { [K in ShareUnit]: SetupOf<K> } = {
  monopoly: {
    settings: DEFAULT_SETTINGS,
    players: [{ name: "小明", color: "#f43f5e", character: "cat" }],
    questions: null,
  },
  wheel: { text: "小明\n小華\n\n阿美", removeOnPick: true },
  gacha: { text: "蘋果\n香蕉", putBack: false },
  ichiban: { prizes: defaultIchibanPrizes() },
  memory: {
    preview: true,
    deck: STARTER_DECK.map((g, i) => ({ ...g, id: `shared-${i}` })).concat({
      id: `shared-${STARTER_DECK.length}`,
      faces: ["data:image/webp;base64,AAAA", ""],
      sameFace: true,
    }),
  },
  multiplication: { tables: [2, 7, 9], count: 30 },
  scoreboard: {
    names: ["第 1 組", "小明"],
    step: 5,
    tone: "pastel",
    hueSeed: 123.4,
  },
};

describe.each(Object.keys(samples) as ShareUnit[])("%s 分享連結", (unit) => {
  it("來回編碼不變", async () => {
    const hash = await encodeFor(unit, samples[unit] as never);
    expect(await decodeFor(unit, "#" + hash)).toEqual(samples[unit]);
  });

  it("壞掉或別的格式回 null", async () => {
    expect(await decodeFor(unit, "#setup=%%%")).toBeNull();
    expect(await decodeFor(unit, "#other")).toBeNull();
  });
});

it("各單元不會解別的單元的連結當成自己的", async () => {
  const hash = await encodeFor("scoreboard", samples.scoreboard);
  expect(await decodeFor("multiplication", hash)).toBeNull();
  expect(await decodeFor("wheel", hash)).toBeNull();
});
