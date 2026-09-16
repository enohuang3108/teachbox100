import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { BRAND, BRAND_DARK } from "./design-tokens";

const css = readFileSync(join(process.cwd(), "styles", "globals.css"), "utf8");

/** 讀出某個 selector 區塊裡的一個自訂屬性值。 */
function tokenIn(block: string, name: string): string | undefined {
  const start = css.indexOf(block);
  const body = css.slice(start, css.indexOf("\n}", start));
  return body.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
}

describe("design tokens 與 CSS 同步", () => {
  it.each([
    ["paper", BRAND.paper],
    ["paper-warm", BRAND.paperWarm],
    ["sand", BRAND.sand],
    ["stone", BRAND.stone],
    ["ink", BRAND.ink],
    ["ink-soft", BRAND.inkSoft],
    ["brand-yellow", BRAND.yellow],
    ["brand-red", BRAND.red],
    ["brand-blue", BRAND.blue],
    ["brand-green", BRAND.green],
  ])("亮色 --%s", (name, value) => {
    expect(tokenIn("\n:root {", name)).toBe(value);
  });

  it.each([
    ["brand-yellow", BRAND_DARK.yellow],
    ["brand-red", BRAND_DARK.red],
    ["brand-blue", BRAND_DARK.blue],
    ["brand-green", BRAND_DARK.green],
  ])("暗色 --%s", (name, value) => {
    expect(tokenIn("\n.dark {", name)).toBe(value);
  });
});
