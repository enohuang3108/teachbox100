# 購物（/coin/buy）

## COINBUY-001 介紹頁 → 設定 → 出第一題
- smoke: True
- viewport: desktop, mobile
- auto: e2e/game-template.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /coin/buy
  2. 確認只看到介紹頁：大標、說明、「開始練習」鈕，頂列沒有設定／全螢幕鈕
  3. 按「開始練習」
  4. 設定 Dialog 出現，按 Dialog 裡的「開始練習」
- 預期: 出現第一題與作答區，頂列出現設定鈕，全螢幕鈕在最後一顆，無 console error
- issues: —

## COINBUY-002 設定會記住、重整回介紹頁
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 待寫進 e2e
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /coin/buy → 開始練習 → 改一個設定值 → 開始練習
  2. 重新整理
  3. 再按開始練習打開設定
- 預期: 重整後回到介紹頁；設定 Dialog 仍是剛才改過的值
- issues: —

## COINBUY-003 拖放商品到購物車
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 拖放手感
- 前置: 進入作答
- 步驟:
  1. 把一個商品拖進購物車
  2. 付款
- 預期: 商品進購物車，金額加總正確
- issues: —

## COINBUY-004 進介紹頁不預載 3D 模型
- smoke: false
- viewport: desktop
- auto: manual —— 量 network
- 前置: 清快取
- 步驟:
  1. 開 /coin/buy，停在介紹頁
  2. 看 network 的 .glb
- 預期: 介紹頁不下載 .glb，總傳輸量 < 3MB
- issues: —
