# 計時器（/timer）

## TIMER-001 開始、暫停、重設
- smoke: True
- viewport: desktop, mobile
- auto: e2e/instant-tools.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /timer → 開始使用
  2. 開始 → 暫停 → 重設
- 預期: 狀態依序切換，右下主鈕計時中變紅
- issues: —

## TIMER-002 倒數到 0 響鈴
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 響鈴要人耳確認，agent 只能驗畫面提示
- 前置: TIMER-001
- 步驟:
  1. 選 01:00 → 開始，等到 0（UI 最小單位是分鐘）
- 預期: 到 0 響鈴、畫面提示
- issues: —
