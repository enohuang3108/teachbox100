# 計分板（/scoreboard）

## SCORE-001 開始計分、加分、切步長
- smoke: True
- viewport: desktop, mobile
- auto: e2e/instant-tools.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /scoreboard → 開始使用 → 下一步 → 開始計分
  2. 第 1 組加 1 分，步長切 5 分再加
- 預期: 分數 1 → 6
- issues: —

## SCORE-002 學生加入與搶答
- smoke: False
- viewport: desktop, mobile
- auto: e2e/scoreboard-live.spec.ts, e2e/scoreboard-buzz.spec.ts
- 前置: 開房
- 步驟:
  1. 學生開加入頁輸入名字
  2. 按鈴
- 預期: 老師端 5 秒內看到學生與按鈴順序
- issues: —

## SCORE-003 兩支真手機斷線重連、重建房間
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 多實體裝置與網路切換
- 前置: 老師電腦開房
- 步驟:
  1. 兩支手機加入
  2. 一支切飛航再切回
  3. 老師重新建立房間
- 預期: 重連後保留名次；重建後學生收到提示可重新加入
- issues: —

## SCORE-004 學生端只接受老師推的狀態
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 需兩個 peer 與自送訊息（security）
- 前置: 老師開房、兩個學生分頁加入
- 步驟:
  1. 學生 A 用 devtools 對房間送 state action
- 預期: 學生 B 畫面不受影響
- issues: —

## SCORE-005 不能用別人的 uid 認領格子
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 需自送 join（security）
- 前置: 老師開房、學生 A 加入
- 步驟:
  1. 學生 B 送 join 帶 A 的 uid
- 預期: A 的格子與按鈴不受影響
- issues: —
