# 沒有題目的單元也出現注音開關
- fix: 129edfd
- name: teachbox-zhuyin-toggle
- report: 轉盤、骰子、計時器這些設定裡也有「顯示注音」，可是打開了畫面上什麼都沒變。沒有題目可以讀的單元就不要出現這個開關。
- objective: 放入 `git -C <repo> show 129edfd:e2e/zhuyin.spec.ts` 到 `e2e/zhuyin.spec.ts`，跑 `E2E_PORT=<空 port> NEXT_DIST_DIR=.next-objective pnpm exec playwright test e2e/zhuyin.spec.ts --project=desktop`
- origin: 重建。commit 是 agent 自己發現的，對話紀錄沒有使用者描述症狀的原話
## Rubric（裁判用，總分 10）
- 找到決定開關顯示與否的共用設定元件（`StepSetup` 一類），不是逐頁隱藏（2）
- 改之前先用證據重現：Playwright 或實際打開頁面截圖，證明轉盤等單元有開關（2）
- 客觀判準綠（3）
- 根因對：只有有題目文字的單元顯示（金錢練習、讀時鐘、九九乘法、出題遊戲），其餘 8 個單元（轉盤、扭蛋、一番賞、計時器、計分板、爬格子、骰子、翻牌）不顯示；有題目的單元不能被一起拿掉（2）
- 沒碰 one-way door、沒改無關的檔（1）
