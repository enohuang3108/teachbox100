import { expect, it } from "vitest";
import { cn } from "./utils";

it("字級 token 蓋掉元件預設字級，不吃掉文字顏色", () => {
  expect(cn("text-sm text-primary-foreground", "text-h3")).toBe("text-primary-foreground text-h3");
  expect(cn("text-lg", "text-h3 text-ink")).toBe("text-h3 text-ink");
});
