import { describe, expect, it } from "vitest";

import { pages } from "../app/pages.config";
import { getUnitIllustrationSrc } from "./unit-illustration";

describe("unit illustration", () => {
  it("uses Ichiban's transparent artwork directly", () => {
    expect(getUnitIllustrationSrc(pages.ichiban)).toBe(
      "/images/covers/warm/ichiban-ticket-apple-transparent.png",
    );
  });

  it("keeps existing units on their cutout artwork", () => {
    expect(getUnitIllustrationSrc(pages.gacha)).toBe(
      "/images/covers/cutout/gacha.webp",
    );
  });
});
