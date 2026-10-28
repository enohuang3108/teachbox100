# 首頁

老師從 `/` 出發，兩步之內要能到每一個單元：首頁只露分類（抽籤、認識金錢）與獨立單元，分類頁列出旗下的單元。
卡片依搜尋流量排序。主視覺的教具箱一開始是關著的，點一下打開、阿黃與教具彈出來，再點一下收回去。

## Sub-features

- `grid`：首頁 `#games` 的連結剛好是 12 個入口；`/draw` 列 5 個子單元、`/coin` 列 6 個
- `order`：高流量的單元排在前面（抽籤、噪音計、翻牌配對、認識金錢、讀時鐘、大富翁）
- `toolbox`：教具箱關著 → 點開 → 再點關上；卡牆最後一格是意見卡

## How to get to it (user POV)

- 打開 `https://teachbox100.com/`；每一頁左上角的 logo 都會回到這裡
- 分類頁：首頁卡片「抽籤」→ `/draw`，「認識金錢」→ `/coin`

## Driving it with Playwright

Preconditions: baseline。

- `.agent/verify drive home grid` → 三個頁面的連結清單與預期完全相同；`_home.png` 看得到卡牆
- `.agent/verify drive home order` → 卡片順序符合流量排序
- `.agent/verify drive home toolbox` → trace 裡看得到箱子 關→開→關 的三個狀態

## Gotchas

- `grid` 一個案例裡冷編譯三個路由，dev 第一次跑會比較慢（spec 用了 `test.slow()`）
- 新增單元時，`grid` 的預期清單要跟著改（`e2e/home.spec.ts`），這是故意的合約
- 教具箱動畫有 `prefers-reduced-motion` 分支，headless 預設不開減少動態效果
