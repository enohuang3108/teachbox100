#!/usr/bin/env node
/**
 * 擋掉已經有 token 卻繞過去的寫法。規則寫在 .agents/skills/design-system/SKILL.md。
 * 只掃我們自己的 UI —— components/atoms/shadcn 是 vendored 的，照上游長相留著。
 */
import { globSync, readFileSync } from "node:fs";

const PALETTE =
  "slate|gray|zinc|neutral|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const RULES = [
  {
    // 顏色一律走 token：紙感色票會跟著暗色模式走，Tailwind 內建色階不會
    pattern: new RegExp(
      `(?<![\\w-])(bg|text|border|from|via|to|ring|fill|stroke|outline|accent|caret|placeholder|divide)-(${PALETTE})-\\d{2,3}(?![\\w-])`,
      "g",
    ),
    hint: "改用語意 token（bg-card / text-muted-foreground / bg-success-soft…）",
  },
  {
    pattern: /(?<![\w-])(bg|text|border)-(white|black)(?![\w-])/g,
    hint: "改用 bg-paper / text-ink / bg-card",
  },
  {
    pattern: /(?<![\w-])transition-all(?![\w-])/g,
    hint: "列舉屬性：transition-[transform,box-shadow]",
  },
  {
    pattern: /(?<![\w-])hover:scale-/g,
    hint: "hover 用 hover:-translate-y-[3px]，scale 會讓 next/image 糊掉",
  },
  {
    // z-10 是元件內部的區域堆疊，留著；20 以上是跨頁層級，那才需要一個名字
    pattern: /(?<![\w-])(?<!-)z-(?:[2-9]\d|\d{3,})(?![\w-])/g,
    hint: "跨頁層級用 z-(--z-sticky|--z-header|--z-overlay|--z-modal|--z-toast)",
  },
];

// shadcn 與 sheet 是 vendored 的，照上游長相留著，升級時才 diff 得乾淨
const VENDORED = /\/shadcn\/|\/molecules\/sheet\.tsx$/;
const files = globSync("{app,components,lib}/**/*.{ts,tsx}").filter(
  (file) => !VENDORED.test(file),
);

let failed = 0;
for (const file of files) {
  const source = readFileSync(file, "utf8");
  const lines = source.split("\n");
  for (const { pattern, hint } of RULES) {
    for (const [index, line] of lines.entries()) {
      // 註解裡提到違規寫法是在解釋規則本身，不算違規
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
      for (const match of line.matchAll(pattern)) {
        console.log(`${file}:${index + 1}  ${match[0]}  → ${hint}`);
        failed += 1;
      }
    }
  }
}

if (failed > 0) {
  console.log(`\n${failed} 處繞過 design token。`);
  process.exit(1);
}
console.log("design token: 乾淨");
