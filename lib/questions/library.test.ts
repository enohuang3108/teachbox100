import { describe, expect, it } from "vitest";
import { migrateTerritory } from "@/lib/territory/store";
import { useSpeechStore } from "./speech";
import { activeQuestions, adoptLegacyBank, findBank, receiveSharedBank, useQuestionLibrary } from "./library";
import type { Question } from "./types";

const q = (text: string): Question => ({ id: text, type: "boolean", text, answer: "是", difficulty: "easy" });

describe("共用題庫清單", () => {
  it("同名題庫覆蓋並排到最上面，帶 id 是改同一份", () => {
    const { saveBank, removeBank } = useQuestionLibrary.getState();
    saveBank({ title: "自然", questions: [q("a")], off: [] });
    const math = saveBank({ title: "數學", questions: [q("b")], off: [] });
    const nature = saveBank({ title: "自然", questions: [q("c"), q("d")], off: ["d"] });
    expect(useQuestionLibrary.getState().banks.map((b) => b.title)).toEqual(["自然", "數學"]);
    expect(activeQuestions(findBank(useQuestionLibrary.getState().banks, nature)!)).toEqual([q("c")]);
    saveBank({ id: math, title: "數學 2", questions: [q("b")], off: [] });
    expect(useQuestionLibrary.getState().banks.map((b) => b.title)).toEqual(["數學 2", "自然"]);
    removeBank(nature);
    expect(findBank(useQuestionLibrary.getState().banks, nature)).toBeNull();
  });

  it("舊版單元自己存的題庫搬進共用清單，重複搬不會多一份", () => {
    useQuestionLibrary.setState({ banks: [] });
    expect(adoptLegacyBank("legacy-x", "舊題庫", [])).toBeNull();
    adoptLegacyBank("legacy-x", "舊題庫", [q("a")]);
    adoptLegacyBank("legacy-x", "舊題庫", [q("a")]);
    expect(useQuestionLibrary.getState().banks).toHaveLength(1);
  });

  it("領地戰舊資料：自訂題庫搬進清單並繼續選它，朗讀偏好搬進共用設定", () => {
    useQuestionLibrary.setState({ banks: [] });
    const state = migrateTerritory({ bank: [q("a")], useDefault: false, cap: "easy", reading: false, speechRate: 1.2, voiceURI: "v" }, 0);
    expect(state).toEqual({ cap: "easy", bankId: "legacy-territory" });
    expect(useQuestionLibrary.getState().banks[0]).toMatchObject({ title: "領地戰自訂題庫", questions: [q("a")] });
    expect(useSpeechStore.getState()).toMatchObject({ reading: false, speechRate: 1.2, voiceURI: "v" });
    expect(migrateTerritory({ bank: [], useDefault: true }, 0)).toEqual({ bankId: null });
    migrateTerritory({ reading: true }, 0);
    expect(useSpeechStore.getState().speechRate).toBe(1.2); // 沒存的欄位不蓋掉
  });

  it("收到分享的題庫跟自己的同名時另存一份，不蓋掉自己的；同一條連結再開選回同一份", () => {
    useQuestionLibrary.setState({ banks: [] });
    const { saveBank } = useQuestionLibrary.getState();
    const mine = saveBank({ title: "第三課", questions: [q("a"), q("b")], off: ["b"] });
    // 分享連結解出來的題目 id 是重新編的
    const shared = [{ ...q("c"), id: "q0" }];
    const got = receiveSharedBank(shared, "第三課")!;
    expect(got).not.toBe(mine);
    const banks = () => useQuestionLibrary.getState().banks;
    expect(findBank(banks(), mine)).toMatchObject({ title: "第三課", off: ["b"] });
    expect(findBank(banks(), got)?.title).toBe("第三課（分享）");
    expect(receiveSharedBank([{ ...q("c"), id: "q9" }], "第三課")).toBe(got);
    expect(receiveSharedBank([q("d")], "第三課")).not.toBe(got);
    expect(banks().map((b) => b.title)).toContain("第三課（分享 2）");
    expect(receiveSharedBank(null, "第三課")).toBeNull();
  });

  it("收到的題目跟清單裡某份相同時，照分享者勾選的題目出", () => {
    useQuestionLibrary.setState({ banks: [] });
    const { saveBank } = useQuestionLibrary.getState();
    const two = [q("a"), q("b")];
    const mine = saveBank({ title: "第四課", questions: two, off: ["b"] });
    const banks = () => useQuestionLibrary.getState().banks;
    // 自己現在出的題目就是連結那幾題：直接選回，不動勾選
    expect(receiveSharedBank([q("a")], "第四課")).toBe(mine);
    expect(findBank(banks(), mine)?.off).toEqual(["b"]);
    // 連結帶全部題目：選回同一份並重新勾回來
    expect(receiveSharedBank(two, "第四課")).toBe(mine);
    expect(findBank(banks(), mine)?.off).toEqual([]);
    expect(banks()).toHaveLength(1);
  });
});
