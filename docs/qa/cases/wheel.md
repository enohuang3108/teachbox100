# 抽籤轉盤（/draw/wheel）

## WHEEL-001 以老師名單開始並轉出結果
- smoke: True
- viewport: desktop, mobile
- auto: e2e/setup-and-start.spec.ts, e2e/wheel-result.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /draw/wheel
  2. 開始使用 → 名單輸入 小明、小華 → 下一步 → 開始
  3. 按「轉動轉盤」等停下
- 預期: 轉盤轉動後停在其中一人，結果文字可讀
- issues: —

## WHEEL-002 全螢幕投影下轉動與結果可讀
- smoke: False
- viewport: desktop
- auto: manual —— 投影可讀性
- 前置: WHEEL-001 開局
- 步驟:
  1. 按全螢幕
  2. 轉動一次
- 預期: 舞台填滿全螢幕且轉盤不被裁切，結果留在可視範圍並清楚可見；教室後排能讀到結果
- issues: —

## WHEEL-003 分享名單設定
- smoke: false
- viewport: desktop, mobile
- auto: manual —— `lib/share/units.test.ts` 保護編解碼，跨分頁套用設定尚無瀏覽器斷言
- 前置: 清掉 localStorage
- 步驟:
  1. 輸入兩個不同名字，在設定最後一站複製完整分享連結
  2. 用新分頁開連結
- 預期: 設定自動打開並帶入相同名單；顯示載入提示，網址 hash 被清掉
- issues: —
