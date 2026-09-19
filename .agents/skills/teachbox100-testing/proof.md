# Daily proof

## 1. Declare the proof

Before changing code, name all three:

1. The matrix row or rows affected, read from `docs/testing.md`.
2. The public behavior being protected.
3. One seam that can make that behavior **red**.

This declaration belongs in the task plan or handoff. A new unit adds its matrix row before implementation, and a change to a unit's public behavior or its real-device requirement edits that row in the same change.

**Done:** all three named, and the matrix row exists.

## 2. Record automated evidence

Run the proof through `pnpm verify:change`. It runs the command first; only a passing command writes a receipt in `.agents/verification/` carrying the matrix row, behavior, commit, and a hash of the changed product code.

測試檔名直接接在 script 後面，中間不要再加一個 `--` —— 多的那個會被 vitest 與 Playwright 當成不生效的位置參數，過濾失效、整套都跑，receipt 記下的範圍也就是錯的。

```bash
# Deterministic behavior
pnpm verify:change -- \
  --matrix "計分板" \
  --behavior "搶答排序相同時保留正確順序" \
  --seam unit -- \
  pnpm test lib/scoreboard/game.test.ts

# Teacher or student browser flow
pnpm verify:change -- \
  --matrix "購物" \
  --behavior "商品可拖入購物車" \
  --seam e2e -- \
  env E2E_PORT=3199 NEXT_DIST_DIR=.next-e2e pnpm test:e2e e2e/game-template.spec.ts
```

`.githooks/pre-commit` reads that receipt: a commit touching `app/`, `lib/`, `components/`, or `hooks/` needs one whose hash matches the staged code. The gate holds for every agent and for hand-typed commits, so the proof is a precondition for committing rather than a convention. `git commit --no-verify` is the deliberate escape hatch, and the receipt is evidence for the current worktree only — changing the protected behavior again means proving it again.

For UI behavior, also run `pnpm lint:tokens` and inspect the changed state in both light and dark.

**Done:** a receipt exists for every changed public behavior, written after the last edit to that behavior.

## 3. Hand off real-device behavior

Microphone, WebRTC, real touch and drag feel, physics, animation and audio, projection readability, and multi-device behavior are verified by `/qa-test`. Their evidence is the relevant case and QA report, not a receipt.

`LIVE_WEBRTC=1` uses public relays, which makes it real-environment verification rather than CI evidence.

**Done:** each real-device requirement has a `/qa-test` result, or a handoff naming what a person has to do.

## 4. Close the change

Run the affected proof first, then `pnpm test` and `pnpm lint`. A change crossing a shared template, navigation, or a broad browser flow also runs the relevant Playwright spec.

A release, or a behavior needing real devices, invokes `/qa-test` — procedure in [`qa.md`](qa.md) — which owns the cases, screenshots, report, and release verdict.

**Done:** every changed public behavior has a current receipt, the matrix describes the unit accurately, and every real-device requirement is either verified or handed off.
