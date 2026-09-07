// 對正式站跑 Lighthouse，把數字追加到 docs/seo/history.md，之後改 SEO 才有前後可比。
// 用法：pnpm seo:snapshot            （預設桌機；老師多用電腦教學）
//       pnpm seo:snapshot mobile
import { execSync } from "node:child_process";
import { appendFileSync, existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SITE = "https://teachbox100.com";
const PATHS = ["/", "/coin", "/coin/change", "/clock/current-time"];
const HISTORY = "docs/seo/history.md";
const form = process.argv[2] === "mobile" ? "mobile" : "desktop";
const date = new Date().toISOString().slice(0, 10);
const out = mkdtempSync(join(tmpdir(), "lh-"));

if (!existsSync(HISTORY)) {
  appendFileSync(
    HISTORY,
    "# SEO 數據紀錄\n\n每次改完 SEO 跑 `pnpm seo:snapshot`，Lighthouse 模擬節流，同裝置才能互比。\n\n| 日期 | 裝置 | 頁面 | Perf | FCP | LCP | TBT | CLS | 總 KB | 字型 KB | JS KB |\n|---|---|---|---|---|---|---|---|---|---|---|\n",
  );
}

const kb = (items, type) =>
  Math.round(
    items
      .filter((i) => i.resourceType === type)
      .reduce((s, i) => s + (i.transferSize ?? 0), 0) / 1024,
  );
const sec = (a, k) => (a[k].numericValue / 1000).toFixed(1) + "s";

for (const path of PATHS) {
  const file = join(out, path.replaceAll("/", "_") + ".json");
  execSync(
    `npx --yes lighthouse ${SITE}${path} --preset=${form === "desktop" ? "desktop" : "perf"} --form-factor=${form} --screenEmulation.${form} --only-categories=performance --output=json --output-path=${file} --chrome-flags="--headless=new --no-sandbox" --quiet`,
    { stdio: "inherit" },
  );
  const { audits: a, categories } = JSON.parse(readFileSync(file, "utf8"));
  const items = a["network-requests"].details.items;
  const row = [
    date,
    form,
    path,
    Math.round(categories.performance.score * 100),
    sec(a, "first-contentful-paint"),
    sec(a, "largest-contentful-paint"),
    Math.round(a["total-blocking-time"].numericValue) + "ms",
    a["cumulative-layout-shift"].numericValue.toFixed(3),
    Math.round(a["total-byte-weight"].numericValue / 1024),
    kb(items, "Font"),
    kb(items, "Script"),
  ];
  appendFileSync(HISTORY, `| ${row.join(" | ")} |\n`);
  console.log(row.join("\t"));
}
console.log(`寫入 ${HISTORY}`);
