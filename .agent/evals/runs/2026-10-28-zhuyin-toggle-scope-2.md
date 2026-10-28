# zhuyin-toggle-scope run 2
- clone: /private/tmp/teachbox-zhuyin-toggle-c0d282
- candidate: Claude Opus 5.5 general-purpose subagent

## 回覆
I fixed it and committed `742ffdf`. The units with nothing to read no longer show the 「顯示注音」 switch on any setup step.

**Units that keep the switch:** the five coin practice units, 認識時間 (`/clock/current-time`), and the four quiz games.
**Units that lose it:** wheel, dice, timer, gacha, ichiban, ladder, memory, scoreboard, and multiplication.
**Multiplication is my own call.** Its questions and answers are only numbers, so turning 注音 on changed nothing there either. If you want it back, add the `zhuyin` prop to `components/multiplication/SetupPanel.tsx`.

**What changed (8 files):** `StepSetup.tsx` shows the switch only with a `zhuyin` prop; `GamePageTemplate.tsx` and the four quiz `SetupPanel.tsx` pass it; `e2e/zhuyin.spec.ts` checks each step of every unit; `docs/testing.md` row updated.

**Tests:** `pnpm verify:change` ran `e2e/zhuyin.spec.ts` against a production build: 44/44; `pnpm test` 379; lint and lint:tokens clean. First dev run had 7 page-load timeouts while compiling; production run fixed that. Did not check light/dark by eye.

**One gap:** a teacher who already turned 注音 on in multiplication keeps that stored setting and can no longer turn it off.
