# 大富翁（/monopoly）

## MONO-001 介紹 → 三步設定 → 第一位玩家回合
- smoke: True
- viewport: desktop, mobile
- auto: e2e/setup-and-start.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /monopoly
  2. 開始遊戲 → 下一步 → 下一步 → 開始遊戲
- 預期: 出現「擲骰子」鈕
- issues: —

## MONO-002 差異化出題：不同玩家拿到對應難度題目
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 待確認設定 UI 後寫 e2e
- 前置: 清掉 localStorage
- 步驟:
  1. 設定兩位玩家不同難度
  2. 各擲一次骰子到題目格
- 預期: 各自題目符合設定難度
- issues: —

## MONO-003 完整多人回合與全螢幕
- smoke: False
- viewport: desktop
- auto: manual —— 投影、多回合流程
- 前置: MONO-001 開局
- 步驟:
  1. 全螢幕
  2. 三位玩家各走兩輪
- 預期: 輪到誰清楚、棋子走完才換人，無卡死
- issues: —

## MONO-004 手機棋盤不被玩家卡與擲骰鈕蓋住
- smoke: false
- viewport: mobile
- auto: manual —— 視覺
- 前置: MONO-001 開局
- 步驟:
  1. 390×844 看主畫面
- 預期: 棋盤格文字完整，玩家卡與擲骰子鈕不壓在棋盤上，骰子在畫面內
- issues: —

## MONO-005 頂列有設定、順序符合約定
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 視覺
- 前置: MONO-001 開局
- 步驟:
  1. 看頂列鈕
- 預期: 重新開始 → 設定 → 音效 → 全螢幕，文字與其他單元一致
- issues: —
