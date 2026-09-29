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
- auto: e2e/memory-completion.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開始使用，牌組加到上限 15 組
- 預期: 開始上方出現錯誤訊息，開始鈕 disabled，顯示「已用 / 上限」
- issues: case 原寫 16 組，實際上限 15，已修正

## MEM-003 配對完成的結算
- smoke: False
- viewport: desktop, mobile
- auto: e2e/memory-completion.spec.ts
- 前置: 預設牌組開局
- 步驟:
  1. 把所有牌配對完
- 預期: 出現完成畫面，可重新開始
- issues: —

## MEM-004 分享牌組設定
- smoke: false
- viewport: desktop, mobile
- auto: manual —— `lib/share/units.test.ts` 保護編解碼，跨分頁套用設定尚無瀏覽器斷言
- 前置: 清掉 localStorage
- 步驟:
  1. 在設定頁改變牌組，複製完整分享連結
  2. 用新分頁開連結
- 預期: 設定自動打開並帶入相同牌組；顯示載入提示，網址 hash 被清掉
- issues: —

## MEM-005 分享照片過大時給出提示
- smoke: false
- viewport: desktop
- auto: e2e/memory-photo-share.spec.ts, lib/memory/share.test.ts
- 前置: 準備可上傳的大照片
- 步驟:
  1. 把照片加到翻牌卡面並嘗試建立分享連結
- 預期: 分享前自動壓縮；壓縮後仍超過短連結大小上限時提示圖片過大，不產生失效連結
- issues: —
