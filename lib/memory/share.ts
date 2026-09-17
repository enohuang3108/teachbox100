import {
  clean,
  defineCodec,
  flag,
  readFlag,
  RS,
  rows,
  US,
} from "@/lib/share/codec";
import { isImageFace, type PairGroup } from "./game";
import { reencodeFace } from "./image";

export interface MemorySetup {
  deck: PairGroup[];
  preview: boolean;
}

/**
 * 照片總長放得進這個量就原圖分享；放不進就整副牌一起往下降一級，品質一致。
 * 壓縮後的連結實測約是照片總長的 0.9 倍，240KB 落在短連結上限 256KB（app/api/share/route.ts）以內。
 * 實測 15 組全放照片（30 張，本機每張約 13KB）停在 280px q0.7。
 */
export const SHARE_IMAGE_BUDGET = 240_000;
const LADDER: [size: number, quality: number][] = [
  [320, 0.7],
  [320, 0.6],
  [280, 0.7],
  [240, 0.7],
  [200, 0.7],
  [160, 0.65],
  [120, 0.6],
];

export async function shrinkDeckForShare(
  deck: PairGroup[],
  reencode = reencodeFace,
  budget = SHARE_IMAGE_BUDGET,
): Promise<PairGroup[]> {
  const images = [...new Set(deck.flatMap((g) => g.faces).filter(isImageFace))];
  const total = (list: string[]) => list.reduce((n, s) => n + s.length, 0);
  if (total(images) <= budget) return deck;

  let smaller = new Map<string, string>();
  for (const [size, quality] of LADDER) {
    smaller = new Map();
    for (const face of images) {
      const next = await reencode(face, size, quality);
      // 重壓反而變大（原圖本來就小）就留原圖
      smaller.set(face, next.length < face.length ? next : face);
    }
    if (total([...smaller.values()]) <= budget) break;
  }
  return deck.map((g) => ({
    ...g,
    faces: g.faces.map((f) => smaller.get(f) ?? f) as [string, string],
  }));
}

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
  async (setup) => ({ ...setup, deck: await shrinkDeckForShare(setup.deck) }),
);
