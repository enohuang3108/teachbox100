# 九九乘法

`/multiplication`：選段數與題數後四選一作答，全部出完才重新洗牌。結算時分數從 0 跳到答對題數，並依得分貼上鼓勵紙膠帶；
答對八成以上撒紙屑。作答紀錄保留，窄螢幕不遮住分數。

## Sub-features

- `start`：選好範圍後開始，出現第一題與四個答案
- `finish`：10 題答錯 1 題，結算顯示 9/10、「好厲害！」，作答紀錄完整且不遮住分數
- `perfect`：全對時顯示滿分貼紙與紙屑畫布

## How to get to it (user POV)

- 首頁「九九乘法」卡 →「開始使用」→ 選段數 →「下一步」→「出幾題」→「開始練習」

## Driving it with Playwright

Preconditions: baseline。`finish` 固定 `Math.random` 讓題目可重現。

- `.agent/verify drive multiplication start` → 看得到題目與 4 個選項按鈕
- `.agent/verify drive multiplication finish` → `.cheer-pop` 含 `9/10`、「再練一輪」出現、`complementary「作答紀錄」` 有 10 筆
- `.agent/verify drive multiplication perfect` → 滿分貼紙與 confetti canvas 出現
- 截圖：`_multiplication.png`

## Gotchas

- `finish` 要一題一題點完 10 題，機器負載高時跑了 2.4 分鐘；超時就設 `BRIGADE_TIMEOUT_MS=120000`，或改用 `launch prod`
- 固定 `Math.random` 會讓紙屑疊成一片，截圖看起來像沒噴，這是假象
- 跳分的滴答音效與勝利音效屬於真機驗收
