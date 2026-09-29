# 瀏覽器設定保存與首頁操作觀察

- 日期：2026-09-25
- run：`2026-09-25-e23a7f9`
- 目標：`http://127.0.0.1:3199`
- 瀏覽器：獨立的 Chromium 無頭實例 `settings-persist-1`；每個案例、每個 viewport 使用新的 browser context。每個設定案例在進入頁面後清除 localStorage 並重整，從介紹頁開始。
- Viewport：桌機 1440×900；手機 390×844。
- 截圖：[`assets/2026-09-25-e23a7f9/`](assets/2026-09-25-e23a7f9/)，皆為新建的 `-verified.png`，未覆寫同目錄既有圖片。

## 設定案例

每一列都實際經過：介紹頁 → 開設定 → 在 UI 改值 → 按設定中的「開始練習」並看到 `#game-stage` → 瀏覽器重整 → 再看到介紹頁且無 `#game-stage` → 再按「開始練習」重開設定 → 讀取重開後 UI 值。下表數值依序為「原值 → UI 改後 → 重開後」。設定操作不是直接改 localStorage。

| 案例 | 桌機 1440×900 | 手機 390×844 | 重開後截圖 |
| --- | --- | --- | --- |
| CLOCK-002 | 「隨機上下午（24 小時制）」關 → 開 → 開；另一項「顯示時間滑桿」維持開 | 關 → 開 → 開；另一項維持開 | [桌機](assets/2026-09-25-e23a7f9/CLOCK-002-desktop-verified.png) · [手機](assets/2026-09-25-e23a7f9/CLOCK-002-mobile-verified.png) |
| COINBUY-002 | 商品單價上限 300 → 500 → 500 元 | 300 → 860 → 860 元 | [桌機](assets/2026-09-25-e23a7f9/COINBUY-002-desktop-verified.png) · [手機](assets/2026-09-25-e23a7f9/COINBUY-002-mobile-verified.png) |
| COINCHG-002 | 最大金錢上限 300 → 500 → 500 元 | 300 → 860 → 860 元 | [桌機](assets/2026-09-25-e23a7f9/COINCHG-002-desktop-verified.png) · [手機](assets/2026-09-25-e23a7f9/COINCHG-002-mobile-verified.png) |
| COINEQ-002 | 點「1」元硬幣，顯示從一般樣式變成灰階；重開後恢復一般樣式 | 同桌機 | [桌機](assets/2026-09-25-e23a7f9/COINEQ-002-desktop-verified.png) · [手機](assets/2026-09-25-e23a7f9/COINEQ-002-mobile-verified.png) |
| COINPAY-002 | 最大金錢上限 300 → 500 → 500 元 | 300 → 860 → 860 元 | [桌機](assets/2026-09-25-e23a7f9/COINPAY-002-desktop-verified.png) · [手機](assets/2026-09-25-e23a7f9/COINPAY-002-mobile-verified.png) |
| COINVAL-002 | 回答方式「數字調整」→「選擇題」→「選擇題」 | 同桌機 | [桌機](assets/2026-09-25-e23a7f9/COINVAL-002-desktop-verified.png) · [手機](assets/2026-09-25-e23a7f9/COINVAL-002-mobile-verified.png) |

COINEQ-002 的重現步驟：在全新 context 開 `/coin/equivalent`，按介紹頁「開始練習」，在「可用硬幣」點「1」使其灰階，按設定中的「開始練習」，重整頁面並再按「開始練習」。兩種 viewport 中，重開設定後「1」皆顯示一般樣式。這次流程未觀察到任何 pageerror。

## 首頁案例

### HOME-003

兩種 viewport 都從全新 context 的 `/` 開始、清除 localStorage 並重整。捲到卡牆，點 `/clock/current-time` 卡片，再用瀏覽器上一頁。URL 與 `window.scrollY` 實測如下：

| Viewport | 點擊前 `/` | 單元頁 | 返回 `/` 當下 | 返回後 500ms | 返回後 2000ms | 截圖 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 桌機 | 268 | 0 | 0 | 268 | 268 | [桌機](assets/2026-09-25-e23a7f9/HOME-003-desktop-verified.png) |
| 手機 | 1525 | 0 | 1525 | 1525 | 1525 | [手機](assets/2026-09-25-e23a7f9/HOME-003-mobile-verified.png) |

卡片點擊前計算出的 `animation-name` 為 `card-enter`；瀏覽器返回當下、500ms 和 2000ms 均為 `none`。桌機返回當下曾短暫測得 `scrollY=0`，500ms 後恢復 268；手機返回當下已是 1525。兩者皆無 pageerror。截圖是返回後 2000ms 的畫面。

### HOME-004

兩種 viewport 都使用新 context（空快取、阻擋 service worker），對所有 script 資源額外延遲 4000ms。開 `/clock/current-time`，在介紹頁「開始練習」鈕首次可見時立即讀取狀態與截圖，接著在按鈕中央做實際滑鼠點擊；再等 5500ms 觀察 hydration 後狀態，最後在可用時再次點擊。

| Viewport | 首次可見 | 首次點擊後 | 5500ms 後 | 可用後點擊 | 首次可見截圖 |
| --- | --- | --- | --- | --- | --- |
| 桌機 | disabled | disabled、設定 Dialog 未開 | enabled、Dialog 未開 | 設定 Dialog 打開 | [桌機](assets/2026-09-25-e23a7f9/HOME-004-desktop-verified.png) |
| 手機 | disabled | disabled、設定 Dialog 未開 | enabled、Dialog 未開 | 設定 Dialog 打開 | [手機](assets/2026-09-25-e23a7f9/HOME-004-mobile-verified.png) |

兩種 viewport 的慢速載入流程都收到一筆 pageerror：`TypeError: Cannot read properties of undefined (reading 'waiting')`。本次未保存該錯誤的 stack；在錯誤之後，按鈕仍變成 enabled，且點擊後設定 Dialog 有打開。
