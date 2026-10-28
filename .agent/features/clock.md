# 學習讀時鐘

`/clock/current-time`：老師用右下角的直立刻度滑桿設定題目時間（拖指針是老師出題，不是學生作答），
時針分針跟著轉，跨過 12 點時上午、下午跟著換。

## Sub-features

- `drag`：滑桿從 11:55 往上調到 12:05，分針從 330° 到 30°，時針前進，鐘面顯示「下午」

## How to get to it (user POV)

- 首頁「學習讀時鐘」卡 →「開始練習」→ 設定對話框「下一步」→「開始練習」→ 右下角滑桿

## Driving it with Playwright

Preconditions: baseline。

- `.agent/verify drive clock drag` → 滑桿 `aria-valuenow` 依序是 715、725；`#clock > div` 第二根（分針）的 style 含 `rotate(30deg)`；`#clock` 含「下午」
- 截圖：`_clock_current-time.png`

## Gotchas

- 操作用鍵盤（End、PageDown、ArrowUp）驅動 Radix slider，比拖曳穩定；真手機的觸控手感仍屬真機驗收
- 鐘面是唯讀的：直接點鐘面不會改時間，這不是 bug
- 指針角度只能從 inline style 讀，沒有 aria 值；改了指針的 DOM 結構，這個 journey 要跟著改
