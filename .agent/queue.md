# queue
一行一個任務：`- [ ] <id>: (<類型>) <使用者會說的那句話>`，類型見 `~/agent-kit/brigade/playbooks.md`。`brigade-run` 依序取 `[ ]`，跑時標 `[~]`，
結束標 `[x]`（有 commit 且有通過的 `.agent/verify` 證據，待老大 review）或 `[!]`（要人處理），下一行寫結果。

- [x] tsc-clean: (bug) 型別檢查 `pnpm exec tsc --noEmit` 在 main 上報 4 個錯（`app/coin/pay/page.tsx` 找不到 `Product`、`app/coin/value/page.tsx` 找不到 `CoinType`、`lib/hooks/use-toast.ts` 引用不存在的 toast 模組）。期望型別檢查 0 個錯，兩個硬幣頁與 toast 的行為不變
  → 待老大 review；審查（grok grok-4.7 high）0 項：分支 agent/tsc-clean（2 commit，11 個決定，$1.73），回覆 /Users/huai/side_project/teachbox100-agent-tsc-clean/.agent/evidence/loop-tsc-clean/reply.md
