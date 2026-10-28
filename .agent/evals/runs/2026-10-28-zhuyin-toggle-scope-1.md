# zhuyin-toggle-scope run 1
- clone: /private/tmp/teachbox-zhuyin-toggle-9de1f4
- candidate: Claude Opus 5.5 general-purpose subagent

## 回覆
Commit `8beab8b` on branch `fix/zhuyin-toggle-readable-units`. The 「顯示注音」 switch now only appears in units that have a question or answer choices to read.

**Cause:** in `StepSetup`, the switch showed on every step whenever a unit didn't set `zhuyinStepKey`. But the Zhuyin font only applies to elements with the `.zhuyin-text` class, and wheel, dice, timer and the others have none, so the switch did nothing there.

**Fix:**
1. `components/organisms/StepSetup.tsx`: new `zhuyin?: boolean` prop. The switch only shows when it's set, or when the unit sets `zhuyinStepKey`.
2. Units that turn it on: all coin practice units and 學習讀時鐘 (shared `GamePageTemplate.tsx`), and `components/multiplication/SetupPanel.tsx`. The four question games already set `zhuyinStepKey`.
3. Units that no longer show it: wheel, gacha, ichiban, ladder, dice, memory, scoreboard, timer.
4. `e2e/zhuyin.spec.ts`: each unit checked both ways.
5. `docs/testing.md` updated.

**Checks:** `e2e/zhuyin.spec.ts` (production mode) 44/44; proof receipt `.agents/verification/a8eb3ebeab20.json`; `pnpm test` 379; lint:tokens clean; tsc errors only in other files.

**Notes:** first two proof runs in dev mode timed out (load ≈550), production build fixed it. The commit first landed on `main`; moved to a new branch and reset `main` back to `a8eb3eb`. Did not look at light/dark.
