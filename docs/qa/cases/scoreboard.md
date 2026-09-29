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
- auto: manual —— `e2e/scoreboard-live.spec.ts`、`e2e/scoreboard-buzz.spec.ts` 需 `LIVE_WEBRTC=1` 與公開 relay，預設閘門會略過；必須另跑並核對結果
- 前置: 開房
- 步驟:
  1. 學生開加入頁輸入名字
  2. 按鈴
- 預期: 老師端 5 秒內看到學生與按鈴順序
- issues: —

## SCORE-003 兩支真手機斷線重連、重建房間
- smoke: False
- viewport: desktop, mobile
- auto: manual —— `e2e/scoreboard-buzz.spec.ts` 用獨立學生瀏覽器驗原房間暫停／恢復、單端離線重開後保留名次、換房號後提示與重新加入；真手機飛航及校園網路仍需實測
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

## SCORE-006 分享組別設定
- smoke: false
- viewport: desktop, mobile
- auto: manual —— `lib/share/units.test.ts` 保護編解碼，跨分頁套用設定尚無瀏覽器斷言
- 前置: 清掉 localStorage
- 步驟:
  1. 修改組別名稱，在設定最後一站複製完整分享連結
  2. 用新分頁開連結
- 預期: 設定自動打開並帶入相同組別；顯示載入提示，網址 hash 被清掉
- issues: —

## SCORE-007 連線失敗時說明原因
- smoke: false
- viewport: desktop, mobile
- auto: e2e/scoreboard-relay-failure.spec.ts, lib/scoreboard/buzz.test.ts
- 前置: 開啟連線搶答，於瀏覽器封鎖 signaling relay
- 步驟:
  1. 嘗試建立房間，等所有 relay 超時
  2. 查看老師端提示，核對 Sentry 事件資料
- 預期: 約 8 秒後顯示連線失敗與可採取的動作；Sentry 有一筆診斷事件，事件不含房號及學生資料
- issues: —
