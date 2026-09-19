import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SEAMS = new Set(["unit", "e2e"]);
// 產品程式碼的範圍：receipt 與 .githooks/pre-commit 的 proof gate 都只看這個 pathspec，
// 文件、設定與測試檔本身的改動不需要 proof —— 寫測試正是讓 seam 變 red 的那一步。
// hook 那份必須逐字相同，否則兩邊算出的 hash 對不上。
const CODE_PATHS = [
  "app",
  "lib",
  "components",
  "hooks",
  ":(exclude)*.test.ts",
  ":(exclude)*.test.tsx",
  ":(exclude)*.spec.ts",
  ":(exclude)*.spec.tsx",
];

export function parseArguments(argv) {
  const rawArguments = argv[0] === "--" ? argv.slice(1) : argv;
  const separator = rawArguments.indexOf("--");
  const optionArgs = separator === -1 ? rawArguments : rawArguments.slice(0, separator);
  const command = separator === -1 ? [] : rawArguments.slice(separator + 1);
  const matrix = [];
  let behavior;
  let seam;

  for (let index = 0; index < optionArgs.length; index += 1) {
    const option = optionArgs[index];
    const value = optionArgs[index + 1];

    if (option === "--matrix") {
      if (!value) throw new Error("--matrix needs a matrix row name.");
      matrix.push(value);
      index += 1;
    } else if (option === "--behavior") {
      if (!value) throw new Error("--behavior needs a public behavior.");
      behavior = value;
      index += 1;
    } else if (option === "--seam") {
      if (!value) throw new Error("--seam needs unit or e2e.");
      seam = value;
      index += 1;
    } else {
      throw new Error(`Unknown option: ${option}`);
    }
  }

  if (matrix.length === 0) throw new Error("Declare at least one --matrix row.");
  if (!behavior) throw new Error("Declare --behavior.");
  if (!SEAMS.has(seam)) throw new Error("--seam must be unit or e2e.");
  if (command.length === 0) throw new Error("Put the proof command after --.");

  return { behavior, command, matrix, seam };
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

// diff 不能 trim：hook 是拿 `git diff | shasum` 比對的，少一個換行 hash 就對不上。
// maxBuffer 放大是因為改到圖片時 binary diff 會超過預設的 1MB。
function gitRaw(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

export function assertMatrixRows(matrix, testingDocument) {
  for (const row of matrix) {
    if (!testingDocument.includes(`| ${row} |`)) {
      throw new Error(`Matrix row not found in docs/testing.md: ${row}`);
    }
  }
}

export function createReceipt({ behavior, command, matrix, seam }, root) {
  const testingDocument = readFileSync(join(root, "docs/testing.md"), "utf8");
  assertMatrixRows(matrix, testingDocument);

  const commit = git(["rev-parse", "HEAD"]);
  const diff = gitRaw(["diff", "--binary", "HEAD"]);
  const codeDiff = gitRaw(["diff", "--binary", "HEAD", "--", ...CODE_PATHS]);
  const receipt = {
    schemaVersion: 1,
    commit,
    diffHash: createHash("sha256").update(diff).digest("hex"),
    codeDiffHash: createHash("sha256").update(codeDiff).digest("hex"),
    recordedAt: new Date().toISOString(),
    matrix,
    behavior,
    seam,
    command,
    status: "passed",
  };
  const directory = join(root, ".agents/verification");

  mkdirSync(directory, { recursive: true });
  const path = join(directory, `${commit.slice(0, 12)}.json`);
  writeFileSync(path, `${JSON.stringify(receipt, null, 2)}\n`);
  return path;
}

export function main(argv = process.argv.slice(2), root = process.cwd()) {
  const proof = parseArguments(argv);
  const result = spawnSync(proof.command[0], proof.command.slice(1), {
    cwd: root,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  if (process.exitCode) return;

  const receiptPath = createReceipt(proof, root);
  console.log(`Proof recorded: ${receiptPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Verification not recorded: ${error.message}`);
    process.exitCode = 1;
  }
}
