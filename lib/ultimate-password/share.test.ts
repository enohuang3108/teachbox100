import { expect, it } from "vitest";
import { defineCodec, US } from "@/lib/share/codec";
import { ultimatePasswordShare } from "./share";

const raw = defineCodec<string>((s) => s, (s) => s);

it("舊連結沒有範圍與限時，帶入 1 到 100、不限時", async () => {
  const hash = await raw.encode(["1", "e", "d"].join(US));
  expect(await ultimatePasswordShare.decode("#" + hash)).toEqual({
    cap: "easy",
    bank: null,
    low: 1,
    high: 100,
    minutes: 0,
  });
});

it("範圍不合法的連結不收", async () => {
  const hash = await raw.encode(["1", "e", "d", "", "50", "10", "0"].join(US));
  expect(await ultimatePasswordShare.decode("#" + hash)).toBeNull();
});

it("1、2 分鐘限時可以帶進分享連結", async () => {
  const hash = await raw.encode(["1", "e", "d", "", "1", "100", "1"].join(US));
  expect(await ultimatePasswordShare.decode("#" + hash)).toMatchObject({ minutes: 1 });
});
