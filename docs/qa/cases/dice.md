# 骰子（/draw/dice）

## DICE-001 文字骰與數字骰結果
- smoke: true
- viewport: desktop, mobile
- auto: e2e/dice.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 設定三顆文字骰並擲骰
  2. 另設兩顆數字骰並擲骰
- 預期: 文字結果皆為設定的六面之一；數字皆介於一到六，總和正確
- issues: —

## DICE-002 投影翻滾與落地音效
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 需投影後排與實際喇叭確認字面方向、可讀性及聲音同步
- 前置: 設定文字骰並開啟音效
- 步驟:
  1. 全螢幕連續擲骰，從後排觀察文字與落地
- 預期: 朝上文字面向畫面、後排可讀，音效對上落地
- issues: —
