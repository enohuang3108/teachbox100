import { clean, defineCodec, num, RS, rows, US } from "@/lib/share/codec";
import type { IchibanPrize } from "./prizes";

export interface IchibanSetup {
  prizes: IchibanPrize[];
}

export const ichibanShare = defineCodec<IchibanSetup>(
  (s) =>
    [
      "1",
      ...s.prizes.map((p) =>
        [clean(p.rank), clean(p.name), p.quantity].join(US),
      ),
    ].join(RS),
  (text) => {
    const [, ...prizes] = rows(text, "1");
    return {
      prizes: prizes.map(([rank = "", name = "", quantity]) => ({
        rank,
        name,
        quantity: num(quantity),
      })),
    };
  },
);
