import { defineCodec, fail, flag, num, readFlag, rows, US } from "@/lib/share/codec";
import { MAX_GROUPS, MIN_GROUPS, type LadderMode } from "./game";

export interface LadderSetup {
  names: string;
  mode: LadderMode;
  results: string;
  groupCount: number;
  hideResults: boolean;
}

// 名單與結果都是多行文字，換行不是分隔字元，原樣放進去
export const ladderShare = defineCodec<LadderSetup>(
  (s) => ["1", s.mode, s.groupCount, flag(s.hideResults), s.names, s.results].join(US),
  (text) => {
    const [[, mode, groupCount, hide, names = "", results = ""]] = rows(text, "1");
    const groups = num(groupCount);
    if (mode !== "custom" && mode !== "groups") fail();
    if (!Number.isInteger(groups) || groups < MIN_GROUPS || groups > MAX_GROUPS) fail();
    return { mode, groupCount: groups, hideResults: readFlag(hide), names, results };
  },
);
