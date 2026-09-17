# 扭蛋機（/draw/gacha）

## GACHA-001 以名單開始，3D 扭蛋漂浮
- smoke: True
- viewport: desktop, mobile
- auto: e2e/setup-and-start.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /draw/gacha
  2. 開始使用 → 名單 小明、小華 → 下一步 → 開始
- 預期: 還剩 2 / 2 顆，扭蛋在箱中漂浮
- issues: —

## GACHA-002 挑球揭曉、收進紀錄、全部放回
- smoke: False
- viewport: desktop, mobile
- auto: e2e/gacha.spec.ts
- 前置: GACHA-001 開局
- 步驟:
  1. 點一顆扭蛋
  2. 繼續抽
  3. 全部放回
- 預期: 揭曉名字、紀錄增加、放回後數量復原
- issues: —

## GACHA-003 搖一搖與長時間抽取的流暢度
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 物理與動畫手感
- 前置: 名單 30 人開局
- 步驟:
  1. 按右下「搖一搖」數次
  2. 連續抽 15 顆
- 預期: 球池堆疊不穿模，揭曉動畫不卡頓
- issues: —

## GACHA-004 手機連抽 30 顆扭蛋不消失
- smoke: false
- viewport: mobile
- auto: manual —— WebGL context 生命週期
- 前置: 名單 30 人開局
- 步驟:
  1. 手機寬度連續抽到剩 0 顆
- 預期: 每一抽扭蛋都在，console 無 Too many active WebGL contexts
- issues: —
