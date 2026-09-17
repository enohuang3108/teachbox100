import { describe, expect, it } from "vitest";

import { pages } from "../app/pages.config";
import { getCoverPresentation } from "./cover-presentation";
import { getUnitIllustrationSrc } from "./unit-illustration";

describe("cover presentation", () => {
  it("shows Ichiban's transparent PNG without a color backdrop", () => {
    expect(getCoverPresentation(pages.ichiban.imageSrc)).toEqual({
      imageClassName: "object-contain",
      imageContainerClassName: "bg-transparent",
      placeholder: "empty",
    });
  });

  it("shows cutout covers without a color backdrop", () => {
    expect(getCoverPresentation(getUnitIllustrationSrc(pages.gacha))).toEqual({
      imageClassName: "object-contain",
      imageContainerClassName: "bg-transparent",
      placeholder: "empty",
    });
  });

  it("keeps warm backdrops for the existing opaque covers", () => {
    expect(getCoverPresentation(pages.gacha.imageSrc)).toEqual({
      imageClassName: "object-cover",
      imageContainerClassName: "bg-sand",
      placeholder: "blur",
    });
  });
});
