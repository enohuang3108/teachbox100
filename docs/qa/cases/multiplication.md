# 九九乘法練習（/multiplication）

## MULT-001 選範圍開始，出第一題
- smoke: True
- viewport: desktop, mobile
- auto: e2e/setup-and-start.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /multiplication → 開始使用 → 下一步 → 開始練習
- 預期: 第 1 / 20 題・答對 0，四個答案
- issues: —

## MULT-002 作答紀錄
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 新功能（154a7e9），待寫 e2e
- 前置: MULT-001
- 步驟:
  1. 答對一題、答錯一題
  2. 完成全部題數
- 預期: 答錯停留較久並標出正解；結算列出作答紀錄與錯題
- issues: —
