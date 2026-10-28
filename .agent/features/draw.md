# 抽籤

課堂點名、分組用的抽籤工具，入口在 `/draw`。轉盤：輸入名單、轉動，結果出現在名單裡並記進「已抽出的名單」。
扭蛋機：點一顆蛋，蛋會飛到中間；再點一下才打開並顯示名字；「繼續抽」收進紀錄。舊網址 `/draw/lottery` 會永久轉到扭蛋機。

## Sub-features

- `wheel`：轉盤轉完顯示「抽到了」，結果是名單裡的人，已抽出名單多 1 列
- `wheel-start`：轉盤與扭蛋機都用老師輸入的名單開始
- `gacha`：挑球 → 打開揭曉 → 繼續抽收進紀錄 → 全部放回
- `redirect`：`/draw/lottery` 回 308 轉到 `/draw/gacha`

## How to get to it (user POV)

- 首頁「抽籤」卡 → `/draw` → 轉盤（`/draw/wheel`）或扭蛋機（`/draw/gacha`）
- 每個單元：「開始使用」→ 名單框「名單，一行一個」→「下一步」→「開始」

## Driving it with Playwright

Preconditions: baseline。

- `.agent/verify drive draw wheel` → 「抽到了」區塊含小明或小華，`complementary「已抽出的名單」` 有 1 個 `li`
- `.agent/verify drive draw wheel-start` → 兩個單元都進到遊戲畫面
- `.agent/verify drive draw gacha` → trace 依序看得到球在中間、揭曉名字、紀錄多一筆、全部放回
- `.agent/verify drive draw redirect` → 回應是 308，Location 指向 `/draw/gacha`
- 截圖：`_draw.png`、`_draw_wheel.png`、`_draw_gacha.png`

## Gotchas

- 轉盤的停格與扭蛋的物理落點是隨機的；斷言只看「結果在名單裡」，不看是誰
- 「開始使用」要等 hydrate 完才會啟用（`UnitHero` 的 `disabled={!hydrated}`）；一直不能按時，先查是不是 dev 在測試中途重新編譯（`web.log` 的 `Compiled`、trace 裡的 `[Fast Refresh] performing full reload`）
- 球池堆疊、開蛋動畫是否順暢屬於真機驗收（`docs/testing.md`），headless 截圖不算數
