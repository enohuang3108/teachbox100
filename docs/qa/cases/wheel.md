# 抽籤轉盤（/draw/wheel）

## WHEEL-001 以老師名單開始並轉出結果
- smoke: True
- viewport: desktop, mobile
- auto: e2e/setup-and-start.spec.ts（開始）；轉動結果 manual
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
- 預期: 舞台等比放大，結果在全螢幕內清楚可見
- issues: —
