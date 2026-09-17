import { defineCodec, fail, GS, num, rows, US } from "@/lib/share/codec";
import { TABLES } from "./multiplication";

export interface MultiplicationSetup {
  tables: number[];
  count: number;
}

export const multiplicationShare = defineCodec<MultiplicationSetup>(
  (s) => ["1", s.count, s.tables.join(GS)].join(US),
  (text) => {
    const [[, count, tables]] = rows(text, "1");
    const parsed = tables ? tables.split(GS).map(num) : [];
    if (parsed.some((t) => !(TABLES as readonly number[]).includes(t))) fail();
    return { tables: parsed, count: num(count) };
  },
);
