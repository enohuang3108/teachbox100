import {
  clean,
  defineCodec,
  flag,
  readFlag,
  RS,
  rows,
  US,
} from "@/lib/share/codec";
import type { PairGroup } from "./game";

export interface MemorySetup {
  deck: PairGroup[];
  preview: boolean;
}

// 圖片牌是 data URL，照樣帶上；太大時短連結建不起來，完整連結仍可用
export const memoryShare = defineCodec<MemorySetup>(
  (s) =>
    [
      ["1", flag(s.preview)].join(US),
      ...s.deck.map((g) =>
        [clean(g.faces[0]), clean(g.faces[1]), flag(g.sameFace)].join(US),
      ),
    ].join(RS),
  (text) => {
    const [[, preview], ...groups] = rows(text, "1");
    return {
      preview: readFlag(preview),
      // id 只在這台裝置上當 key 用，換一組就好
      deck: groups.map(([a = "", b = "", same], i) => ({
        id: `shared-${i}`,
        faces: [a, b],
        sameFace: readFlag(same),
      })),
    };
  },
);
