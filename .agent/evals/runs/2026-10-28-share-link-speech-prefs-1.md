# share-link-speech-prefs run 1
- clone: /private/tmp/teachbox-territory-share-2698c8
- candidate: Claude Opus 5.5 general-purpose subagent

## 回覆
Fixed and committed as `dfbc7f2` on `main` in `/private/tmp/teachbox-territory-share-2698c8`. That repo was already on `main` and the hook let the commit through. Opening someone else's territory link no longer changes your speech on/off setting, speed or voice.

**Cause:** when a link was opened, `app/quiz/territory/page.tsx` copied the link's speech settings into the speech settings store. All four quiz games share that store, so one territory link overwrote your setup everywhere.

**What I changed:**
1. `app/quiz/territory/page.tsx`: removed the code that copied the link's speech settings into the store.
2. `components/territory/SetupPanel.tsx`: share links no longer include your speech settings.
3. `lib/territory/share.ts`: speech fields are gone from the link format. Old links still open; their speech fields are skipped. New links leave those slots empty so the question-bank name keeps its position.
4. `lib/territory/share.test.ts`: replaced the old test with two tests (old link opens without bringing speech in; new links carry none). Both failed before the fix and pass now.
5. `docs/testing.md`: updated the 領地戰 row.

**Checks:** proof receipt `.agents/verification/8fc4854c8185.json`; `pnpm test` 380 pass; `pnpm lint` warnings only; `tsc` same 4 pre-existing errors. I did not run the e2e specs or open the page in a browser.
