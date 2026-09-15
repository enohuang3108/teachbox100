import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { pages } from "../app/pages.config";

describe("Ichiban Kuji cover", () => {
  it("uses the transparent apple ticket artwork", () => {
    expect(pages.ichiban.imageSrc).toBe(
      "/images/covers/warm/ichiban-ticket-apple-transparent.png",
    );

    expect(
      existsSync(
        join(
          process.cwd(),
          "public",
          pages.ichiban.imageSrc.replace(/^\//, ""),
        ),
      ),
    ).toBe(true);
  });
});
