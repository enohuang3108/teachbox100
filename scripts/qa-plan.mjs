#!/usr/bin/env node
// QA scope and report-row draft. Conservative: an unfamiliar product path selects every unit.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename } from "node:path";

const root = new URL("../", import.meta.url);
const at = (path) => new URL(path, root);
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const args = process.argv.slice(2);
const value = (flag) => args[args.indexOf(flag) + 1];
const mode = args.includes("--mode") ? value("--mode") : "changed";
if (args.includes("--help") || !["changed", "weekly", "prod", "unit"].includes(mode)) {
  console.log("node scripts/qa-plan.mjs --mode changed|weekly|prod|unit [--base <git-ref>] [--unit <case-file-stem>]");
  process.exit(args.includes("--help") ? 0 : 2);
}
if (mode === "unit" && (!args.includes("--unit") || !value("--unit"))) {
  throw new Error("--mode unit requires --unit <case-file-stem>");
}

const caseDir = at("docs/qa/cases/");
const files = readdirSync(caseDir).filter((name) => name.endsWith(".md")).sort();
const cases = files.flatMap((file) => {
  const source = readFileSync(new URL(file, caseDir), "utf8");
  const unit = basename(file, ".md");
  const route = source.match(/^# .*?（([^）]+)）/m)?.[1] ?? "";
  const sections = [...source.matchAll(/^## ([A-Z]+-\d+) ([^\n]+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
  if (sections.length === 0) throw new Error(`${file}: no QA cases`);
  return sections.map(([, id, title, body]) => {
    const field = (name) => body.match(new RegExp(`^- ${name}: (.+)$`, "m"))?.[1];
    const smoke = field("smoke");
    const viewport = field("viewport");
    const auto = field("auto");
    if (!smoke || !viewport || !auto) throw new Error(`${file}#${id}: missing smoke, viewport or auto`);
    return { id, title, unit, route, smoke: /^true$/i.test(smoke), viewport, auto };
  });
});
const allUnits = [...new Set(cases.map((item) => item.unit))];
const productUnits = allUnits.filter((unit) => unit !== "home");
const config = readFileSync(at("app/pages.config.ts"), "utf8").split("const pagesConfig = {")[1]?.split("} satisfies Record<string, Page>;")[0] ?? "";
const routes = [...config.matchAll(/^  (?:"[^"]+"|[a-z][\w-]*): \{\n    path: "([^"]+)"/gm)].map((match) => match[1]);
if (!routes.length) throw new Error("could not read app/pages.config.ts routes");
for (const route of routes) {
  if (!cases.some((item) => item.route === route)) throw new Error(`missing QA case file for ${route}`);
}
for (const item of cases) {
  if (item.auto.includes("manual")) continue;
  for (const proof of item.auto.split(",").map((part) => part.trim())) {
    if (!existsSync(at(proof))) throw new Error(`${item.id}: missing auto proof ${proof}`);
  }
}
const selected = new Map();
const add = (unit, reason) => selected.set(unit, [...new Set([...(selected.get(unit) ?? []), reason])]);
const addAll = (reason) => productUnits.forEach((unit) => add(unit, reason));

let base = "—";
if (mode === "weekly") addAll("每週完整基線");
if (mode === "unit") {
  const unit = value("--unit");
  if (!allUnits.includes(unit)) throw new Error(`unknown case file stem: ${unit}`);
  add(unit, "指定單元");
}
if (mode === "prod") allUnits.forEach((unit) => add(unit, "正式站 smoke"));
if (mode === "changed") {
  const reports = readdirSync(at("docs/qa/reports/"))
    .filter((name) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(name)).sort();
  const latest = reports.at(-1);
  base = args.includes("--base")
    ? value("--base")
    : latest
      ? readFileSync(at(`docs/qa/reports/${latest}`), "utf8").match(/^commit: (.+)$/m)?.[1] ?? "origin/main"
      : "origin/main";
  const changed = new Set([
    ...git("diff", "--name-only", base).split("\n"),
    ...git("ls-files", "--others", "--exclude-standard").split("\n"),
  ].filter(Boolean));
  for (const path of changed) {
    if (!/^(app|components|lib|hooks)\//.test(path)) continue;
    if (path === "app/pages.config.ts" || path.startsWith("hooks/")) {
      addAll("共用／未歸屬產品檔（見 diff）");
      continue;
    }
    const owners = productUnits.filter((unit) => {
      const route = cases.find((item) => item.unit === unit)?.route;
      if (!route || route.includes("、")) return false;
      const leaf = route.split("/").at(-1);
      return path.startsWith(`app${route}/`) || path.startsWith(`components/${leaf}/`) || path.startsWith(`lib/${leaf}/`);
    });
    if (owners.length === 1) add(owners[0], path);
    else addAll("共用／未歸屬產品檔（見 diff）");
  }
}

const chosen = cases.filter((item) =>
  mode === "weekly" ? true : mode === "prod" ? item.smoke : selected.has(item.unit) || item.smoke,
);
const ids = new Set();
for (const item of cases) {
  if (ids.has(item.id)) throw new Error(`duplicate case ID: ${item.id}`);
  ids.add(item.id);
}

console.log(`base: ${base}`);
console.log("\n## 範圍");
console.log("| 單元 | 原因 |\n| --- | --- |");
for (const unit of allUnits.filter((name) => selected.has(name))) {
  const reasons = selected.get(unit);
  const shared = reasons.filter((reason) => reason.includes("（見 diff）"));
  const own = reasons.filter((reason) => !reason.includes("（見 diff）"));
  const summary = [...shared, ...(own.length > 3 ? [`${own.length} 個單元檔（見 diff）`] : own)];
  console.log(`| ${unit} | ${summary.join("；")} |`);
}
if (mode === "changed" || mode === "unit") console.log("| 其餘單元 | smoke case |");
console.log("\n## 自動案例草稿");
console.log("| case | 測試檔 | 閘門結果 | 備註 |\n| --- | --- | --- | --- |");
for (const item of chosen.filter((item) => !item.auto.includes("manual"))) {
  console.log(`| ${item.id} | ${item.auto} | 待閘門 | ${item.unit} |`);
}
console.log("\n## 手動結果草稿");
console.log("| case | desktop | mobile | 截圖 | 備註 |\n| --- | --- | --- | --- | --- |");
for (const item of chosen.filter((item) => item.auto.includes("manual"))) {
  const applicable = (viewport) => item.viewport.includes(viewport) ? "待測" : "—";
  console.log(`| ${item.id} | ${applicable("desktop")} | ${applicable("mobile")} | 待填 | ${item.unit} |`);
}
console.error(`${chosen.length} cases: ${chosen.filter((item) => item.auto.includes("manual")).length} manual, ${chosen.filter((item) => !item.auto.includes("manual")).length} auto`);
