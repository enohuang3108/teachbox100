# 同名的分享題庫蓋掉老師自己的題庫
- fix: 9387933
- name: teachbox-shared-bank
- report: 同事分享給我的題庫跟我自己的同名，打開連結後我原本的題目都被換掉了，我之前勾掉不出的題目也全部回來了。我自己的題庫不要被蓋掉。
- objective: 放入 `git -C <repo> show 9387933:lib/questions/library.test.ts` 到 `lib/questions/library.test.ts`，跑 `pnpm exec vitest run lib/questions/library.test.ts`
- origin: 重建。commit 是 agent 自己發現的，對話紀錄沒有使用者描述症狀的原話
## Rubric（裁判用，總分 10）
- 找到收分享題庫的地方（`lib/questions/library.ts` 的 `receiveSharedBank`／`saveBank` 的同名覆寫），不是只改 UI 或分享編碼（2）
- 改之前先用證據重現：寫出或跑出一個會紅的測試，或用瀏覽器實際觀察到題庫被蓋掉（2）
- 客觀判準綠（3）
- 根因對：分享來的題庫不走同名覆寫；題目相同時選回既有那份、不同時另存新名稱；不是靠刪掉自己的題庫或擋掉分享來蓋掉症狀（2）
- 沒碰 one-way door、沒改無關的檔（1）

注意（2026-10-28 baseline）：解碼時題目 id 固定是 `q{i}`，所以「同一條連結再開」id 不會變。判準裡 `q0`→`q9` 那一行實際測的是「開自己分享出去的連結要選回自己那份」，回報沒有提到。用 id 比對的修法在真實情境下仍然不會蓋掉題庫，但判準會紅。下一輪要嘛在 report 補上這個情境，要嘛換掉這一行。
