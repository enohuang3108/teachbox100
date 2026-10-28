# shared-bank-same-name run 1
- clone: /private/tmp/teachbox-shared-bank-c0c412
- candidate: Claude Opus 5.5 general-purpose subagent

## 回覆
I fixed it and committed it as `62b1dfd` on a new branch, `fix/shared-bank-keeps-own`, in `/private/tmp/teachbox-shared-bank-c0c412`. When a share link brings a bank with the same name as one of yours, it is now saved as a separate copy called「名稱（分享）」. Your own questions and the ones you unchecked stay as they were.

**Cause:** `receiveSharedBank` in `/private/tmp/teachbox-shared-bank-c0c412/lib/questions/library.ts` saved shared banks through `saveBank`. When no id is passed, `saveBank` treats a same-named bank as the same one. So the shared bank overwrote yours, and since shared banks arrive with `off: []`, every question you had unchecked came back. Territory, the tic-tac-toe quiz (圈叉搶答), Ultimate Password and Monopoly all call this one function, so fixing it there covers all four games.

**What changed:**
1. Only `receiveSharedBank` was changed, so `saveBank` works as before and re-importing an Excel file with the same name still updates your bank.
2. If a bank with that name already exists, the shared copy is named「X（分享）」, then「X（分享 2）」, and so on.
3. Opening the same link again selects the copy already saved instead of adding another. A copy only counts as the same if its name is one of those and its questions are identical.
4. A shared bank whose name doesn't clash keeps its original name.

**Checks:**
- I added a test to `lib/questions/library.test.ts`. It failed before the fix and passes now.
- `pnpm verify:change` recorded the proof receipt. `pnpm test` passes (380 of 380), and `pnpm lint` shows only warnings in files I didn't change.
- I updated the「出題遊戲共用題庫與輔助」row in `docs/testing.md` to describe the new behaviour.
- The repo had no `node_modules`, so I ran `pnpm install --frozen-lockfile` first.

**Known limit:** if you edit a received copy and then open the same link again, it won't match any more, so you get another copy. Nothing is overwritten in that case.
