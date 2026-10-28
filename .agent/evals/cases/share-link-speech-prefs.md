# 分享連結改掉收件人的朗讀設定
- fix: 342333f
- name: teachbox-territory-share
- report: 打開別人傳給我的領地戰連結之後，我自己設定好的朗讀語速跟聲音都被改掉了。別人的連結不應該動到我的朗讀設定。
- objective: 放入 `git -C <repo> show 342333f:e2e/territory-speech.spec.ts` 到 `e2e/territory-speech.spec.ts`，跑 `E2E_PORT=<空 port> NEXT_DIST_DIR=.next-objective pnpm exec playwright test e2e/territory-speech.spec.ts --project=desktop`
- origin: 重建。commit 是 agent 自己發現的，對話紀錄沒有使用者描述症狀的原話
## Rubric（裁判用，總分 10）
- 找到分享連結編解碼與套用設定的地方（領地戰的 share codec／設定套用），不是改語音播放本身（2）
- 改之前先用證據重現：Playwright 或單元測試紅，或在瀏覽器打開分享連結觀察到偏好被改（2）
- 客觀判準綠（3）
- 根因對：朗讀偏好是裝置自己的，不隨連結帶走，舊連結帶的朗讀欄位收到也不套用；舊連結的其他欄位（題庫名稱）位置仍讀得對（2）
- 沒碰 one-way door、沒改無關的檔（1）
