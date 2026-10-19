# 爬格子（/draw/ladder）

## LADD-001 自訂結果與路線揭曉
- smoke: true
- viewport: desktop, mobile
- auto: e2e/ladder.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 輸入三人名單，結果先填兩個，再補為三個並開始
  2. 按爬下一位，再按同時進行；點選小華的結果
- 預期: 結果數不足有提示；每人對到不同結果；三條路線保留，點結果高亮對應名字與路線
- issues: —

## LADD-002 分組與連點名字
- smoke: false
- viewport: desktop, mobile
- auto: e2e/ladder.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 七人分三組，同時進行
  2. 另開三人局，連點兩個名字
- 預期: 各組人數為 2、2、3；連點不打斷已出發的路線，兩人結果皆揭曉
- issues: —

## LADD-003 三十人投影與音效
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 需投影、實體觸控與喇叭確認可讀性、動畫速度與音效
- 前置: 三十人名單
- 步驟:
  1. 開始並切全螢幕，從後排看三十條線及直書姓名
  2. 手機左右捲動並揭曉結果
- 預期: 名字與路線可辨識、捲動可操作、揭曉聲音正常
- issues: —
