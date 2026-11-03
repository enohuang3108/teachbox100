# 金錢練習（計算金錢價值、付款）

`/coin/value`：數桌上的錢算總額；`/coin/pay`：照商品價格選錢付款。兩頁都走 GamePageTemplate 的介紹頁 → 設定對話框 → 出題。

## Sub-features

- `value`：`/coin/value` 介紹頁按「開始練習」，設定對話框「開始練習」後出題，頂列出現「設定」「重新出題」
- `pay`：`/coin/pay` 同上

## How to get to it (user POV)

- 首頁「認識金錢」分類 →「計算金錢價值」或「付款」卡 →「開始練習」→ 設定對話框「開始練習」

## Driving it with Playwright

Preconditions: baseline。

- `.agent/verify drive coin [value|pay]` → 對到 `e2e/game-template.spec.ts` 的同名案例
- 截圖：`_coin_value.png`、`_coin_pay.png`

## Gotchas

- 剛 `pnpm install` 的 worktree 第一次 dev 編譯 `/coin/value` 會超過 30 秒，`page.goto` 被中斷、「開始練習」鈕停在 disabled（沒 hydrate）；`drive` 的 prewarm 先打過一次就好
