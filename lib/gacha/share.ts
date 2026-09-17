import { defineCodec, flag, readFlag, rows, US } from "@/lib/share/codec";

export interface GachaSetup {
  text: string;
  putBack: boolean;
}

export const gachaShare = defineCodec<GachaSetup>(
  (s) => ["1", flag(s.putBack), s.text].join(US),
  (text) => {
    const [[, putBack, names = ""]] = rows(text, "1");
    return { text: names, putBack: readFlag(putBack) };
  },
);
