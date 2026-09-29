# 計分板安全案例實測觀察（SCORE-004、SCORE-005）

- 日期：2026-09-27；目標：`http://127.0.0.1:3199` 本機 production build。
- 使用隔離的 Chromium browser contexts：老師 1440×900、學生 A 與 B 各 1440×900（desktop 輪）或各 390×844（mobile 輪）。每輪為新房間、新 localStorage，沒有共用學生 uid。下列截圖與數據的房號分別為 `NCEZ`、`DD5G`。
- 老師在 `/scoreboard` 點「開始使用」→ 開啟「連線搶答」→ 關閉自動彈出的 QR →「下一步」→「開始計分」。A、B 分別在 `/scoreboard/join#<房號>` 填入「安全測試A／B」並按「加入」。兩人頁面均顯示「已經加入了，等老師出題」，老師畫面有 A、B 兩格，各 0 分；這證實了基本 WebRTC 同房連線。
- 偽造訊息方式：在 A 或 B 的實際學生瀏覽器內，注入獨立打包的 `trystero/nostr`，以相同 `appId`、房號與公開 relay 建立**額外受控 peer**；用 `makeAction("state")`／`makeAction("join")` 送出封包。這不改產品程式碼，也不直接改接收方 store。送出前等額外 peer 的 `getPeers()` 至少列出另外兩端，`send()` Promise 正常完成。
- 送達證據：在各 context 載入頁面前對 `RTCPeerConnection` 建立的資料通道加上只讀 `message` 計數器。偽造 payload 含 649 字元 `qaMarker`，以封包長度區分同時存在的正常狀態廣播。接收方在送出後收到獨特的 844／832 byte 加密封包；正常背景廣播約 128／172 byte。計數器只看傳輸事件，不解析或修改訊息。

## SCORE-004 學生 A 偽造老師的 `state`

| 視窗 | 送出前老師／A／B | 偽造內容與送達 | 送出後老師／A／B |
| --- | --- | --- | --- |
| Desktop | 老師 A、B 各 0 分；「開始搶答」，無名次。A、B 都顯示「已經加入了，等老師出題」，搶答鍵不可按。 | A 瀏覽器的額外 peer 送 `state({open:true, order:[{id:"forged-peer",uid:"",name:"假老師名次"}], qaMarker})`；`send()` 完成。B 的接收數 27→30，新增封包首筆 **844 bytes**（其餘 128、172）。 | 老師仍是 A、B 各 0 分且「開始搶答」；A、B 仍等待老師出題，B 沒有「假老師名次」，搶答鍵仍不可按。 |
| Mobile | 老師 A、B 各 0 分；A、B 均等待老師出題。 | 同一種 `state`；`send()` 完成。B 接收數 22→25，新增首筆 **844 bytes**（其餘 128、172）。 | 老師、A、B 畫面與送出前相同；B 沒有偽造名次，搶答鍵仍不可按。 |

完成畫面：[桌機 B](assets/score-security-round2/SCORE-004-desktop.png)、[手機 B](assets/score-security-round2/SCORE-004-mobile.png)。

## SCORE-005 學生 B 用 A 的 uid 偽造 `join`

| 視窗 | 送出前老師／A／B | 偽造內容與送達 | 送出後老師／A／B；A 真按鈴 |
| --- | --- | --- | --- |
| Desktop | 老師有「安全測試B」「安全測試A」兩格，各 0 分；A、B 均等待老師出題。A、B 的 uid 分別是 `f0fbdf2a-34b5-4416-b98e-95e39bfe9563`、`089af0a6-4e2d-40ff-bd2f-43823a258bf5`。 | B 瀏覽器的額外 peer 送 `join({uid:<A 的 uid>,name:"冒名的B",qaMarker})`；`send()` 完成。老師接收數 48→51，新增首筆 **832 bytes**（其餘 172）。 | 老師仍只有 A、B 原兩格、各 0 分，沒有「冒名的B」。老師點「開始搶答」後，A 點「搶答」；老師名次顯示「1 安全測試A」，A 顯示「第一個」，B 仍可按鈴。 |
| Mobile | 老師有「安全測試A」「安全測試B」兩格，各 0 分；A、B 均等待老師出題。A、B 的 uid 分別是 `d16fb702-2300-408a-bfe0-480f78b3d994`、`cf92052f-f2d7-401f-839c-2d28f7430cb5`。 | 同一種 `join`，uid 換成當輪 A 的；`send()` 完成。老師接收數 45→50，新增首筆 **832 bytes**（其餘為背景廣播）。 | 老師仍只有 A、B 原兩格、各 0 分，沒有「冒名的B」。A 真按鈴後老師名次顯示「1 安全測試A」；A 顯示「第一個」，B 仍可按鈴。 |

完成畫面：[桌機老師](assets/score-security-round2/SCORE-005-desktop.png)、[手機輪老師](assets/score-security-round2/SCORE-005-mobile.png)、[手機 A 按鈴後](assets/score-security-round2/SCORE-005-mobile-student-A.png)。截圖只存完成後畫面；手機輪的老師仍是 1440×900，學生 A、B 是 390×844。

## 邊界

本次測的是 A 原連線仍在線時的 uid 認領。沒有測 A 真正離線後的重連／冒認，也沒有兩支實體手機與不同網路。觀察只對上述已送達的偽造封包及這兩個 viewport 有效。
