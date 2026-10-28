# shared-bank-same-name run 2
- clone: /private/tmp/teachbox-shared-bank-2776fa
- candidate: Claude Opus 5.5 general-purpose subagent

## 回覆
Fixed and committed as `7118665` on the new branch `fix/shared-bank-keeps-own` in /private/tmp/teachbox-shared-bank-2776fa. That checkout was on `main` and the repo's hook keeps agents off main, so I made the branch first. Nothing has been pushed.

**Cause:** `receiveSharedBank` in lib/questions/library.ts called `saveBank` with no id. When `saveBank` gets no id, it treats a bank with the same name as the same bank and overwrites it. So your colleague's link replaced your questions, and `off` was reset to `[]`, which is why every question you had unticked came back.

**Fix:** a shared link no longer overwrites a bank with the same name.
1. If the name matches but the questions differ, the shared bank is saved as a separate copy called 「名稱（分享）」. A second, different one becomes 「名稱（分享 2）」, and so on.
2. If the name and questions both match (reopening the same link, or opening your own link), it selects the existing copy and keeps your unticked questions.
3. Questions are compared by their content, not their internal ids, using the same row encoding the share link already uses (`questionRow`).

Re-importing your own Excel file with the same name still updates that bank, as before. Only the share-link path changed.

**Files changed:** lib/questions/library.ts (fix); lib/questions/library.test.ts (new test, failed before, passes now); docs/testing.md (row updated).

**Checks:** `pnpm test` 380/380; `pnpm lint` no errors; `tsc` errors only in untouched files; proof receipt `.agents/verification/8f6a2a905d90.json`.
