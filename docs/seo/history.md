# SEO 數據紀錄

每次改完 SEO 跑 `pnpm seo:snapshot`，Lighthouse 模擬節流，同裝置才能互比。

| 日期 | 裝置 | 頁面 | Perf | FCP | LCP | TBT | CLS | 總 KB | 字型 KB | JS KB |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-07 | desktop | / | 67 | 1.0s | 4.3s | 232ms | 0.000 | 3354 | 935 | 815 |
| 2026-09-07 | desktop | /coin | 92 | 1.0s | 1.2s | 131ms | 0.000 | 2088 | 1007 | 518 |
| 2026-09-07 | desktop | /coin/change | 93 | 1.0s | 1.2s | 112ms | 0.001 | 1959 | 795 | 483 |
| 2026-09-07 | desktop | /clock/current-time | 43 | 1.8s | 3.3s | 788ms | 0.000 | 1592 | 790 | 490 |
