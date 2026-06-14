# 互動式機會／命運卡

## 目標
保留卡片寫死,擴充更多張,並新增兩種互動式效果:擲骰子、答題(從題庫)。
機會=正向/機會性質(答錯不罰);命運=懲罰性質(答對只是免於受罰)。

## 卡片效果(types.ts CardEffect 新增)
- [x] diceReward { perPip }：擲一顆骰,點數 × perPip 入袋(perPip 可為負 → 罰款)
- [x] diceMove：擲一顆骰,點數 = 前進步數
- [x] diceBet { amount }：擲一顆骰,單數 +amount / 雙數 −amount
- [x] quiz { reward, onWrong }：答對 +reward;答錯 money 罰款或 jail

## 互動流程(新增 PendingAction)
- [x] cardDice { card, rolled }：抽到互動擲骰卡 → 等玩家擲骰 → 結算
- [x] cardQuiz { card, question }：抽到互動答題卡 → 等玩家作答 → 結算

## rules.ts
- [x] applyCardEffect:互動卡改為設定 cardDice/cardQuiz pending(停止連鎖)
- [x] rollCardDice / resolveCardDice / answerCardQuiz

## UI
- [x] Dice.tsx 匯出單顆 Die 供重用
- [x] CardDiceDialog 新元件(擲骰 → 顯示點數與結果 → 確定)
- [x] QuestionDialog 支援 cardQuiz
- [x] page.tsx 串接

## 驗證
- [x] tsc 無 monopoly 相關錯誤
- [x] 既有 cards.test / rules.test 仍通過
