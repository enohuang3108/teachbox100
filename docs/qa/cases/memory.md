# 翻牌配對（/memory）

## MEM-001 介紹 → 設定兩站 → 開始翻牌
- smoke: True
- viewport: desktop, mobile
- auto: e2e/setup-and-start.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /memory
  2. 開始使用 → 下一步 → 開始遊戲
  3. 翻兩張牌
- 預期: 8 張蓋著的牌、翻牌 1 次
- issues: —

## MEM-002 牌組超過上限時擋住開始
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 待寫進 e2e
- 前置: 清掉 localStorage
- 步驟:
  1. 開始使用，牌組加到上限 15 組
- 預期: 開始上方出現錯誤訊息，開始鈕 disabled，顯示「已用 / 上限」
- issues: case 原寫 16 組，實際上限 15，已修正

## MEM-003 配對完成的結算
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 要翻完整局
- 前置: 預設牌組開局
- 步驟:
  1. 把所有牌配對完
- 預期: 出現完成畫面，可重新開始
- issues: —
