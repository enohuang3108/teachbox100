# share-link-speech-prefs run 2
- clone: /private/tmp/teachbox-territory-share-50ea02
- candidate: Claude Opus 5.5 general-purpose subagent

## 回覆
Fixed and committed as `2da1873` in `/private/tmp/teachbox-territory-share-50ea02`, on top of the existing worktree branch. Opening someone else's territory-battle (領地戰) link no longer changes your reading on/off, speech rate or voice.

**Cause:** the page that opens the link (`app/quiz/territory/page.tsx`) copied the sender's reading, rate and voice into the speech settings that every question game shares on this device. If the sender had never changed them, you got the defaults (0.9×, no voice chosen).

**What changed:**
1. `app/quiz/territory/page.tsx`: opening a link no longer writes the speech settings at all.
2. `components/territory/SetupPanel.tsx`: new share links no longer include the sender's speech settings. The link format itself is unchanged, so links people have already sent still open.
3. `docs/testing.md`, territory row updated.
4. `e2e/shared-setup.spec.ts`: new test — receiver at 1.4×, reading off, own voice; opens a link from a sender on defaults; settings unchanged afterwards.

**Checks:** new test failed before the fix (reset to 0.9×) and passes after; proof `.agents/verification/d78e6bb56b24.json` (4 passed); `pnpm test` 380; lint warnings only; tsc same 4 errors.

**Not related:** multiplication and Monopoly share tests in the same spec timed out at 30 s, also on the code without this change; left out of the proof.
