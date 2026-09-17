import { defineCodec, flag, readFlag, rows, US } from "@/lib/share/codec";

export interface WheelSetup {
  text: string;
  removeOnPick: boolean;
}

// 名單是一整段多行文字，換行不是分隔字元，原樣放進去
export const wheelShare = defineCodec<WheelSetup>(
  (s) => ["1", flag(s.removeOnPick), s.text].join(US),
  (text) => {
    const [[, removeOnPick, names = ""]] = rows(text, "1");
    return { text: names, removeOnPick: readFlag(removeOnPick) };
  },
);
