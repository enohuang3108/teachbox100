# 換頁轉場與上一頁行為

> 2026-09-02。動 `next-view-transitions`、`view-transition-name`、或任何跟捲動還原
> 有關的東西之前先讀這份。四個踩過的坑都附有實測數據，別再踩一次。

相關程式碼：

| 檔案 | 職責 |
|---|---|
| `lib/back-navigation.ts` | 接管上一頁／下一頁的捲動還原，並在 traverse 時掛 `data-restored` |
| `components/atoms/BackScrollRestoration.tsx` | 把上面那支掛到 `<html>`，並在新頁 commit 後 paint 前還原捲動位置 |
| `lib/back-navigation.test.ts` | 假的 Navigation API + **每個 entry 各自一份**的 scrollRestoration |
| `styles/globals.css` | `.site-logo`、`[data-restored] .card-enter` |

---

## 坑 1：`scrollRestoration` 是每個 history entry 各自一份的

**症狀**：內頁捲到底按上一頁，畫面會先把**內頁**捲回頂端，才換成首頁。

**原因**：Next App Router 完全不接管 `history.scrollRestoration`
（`grep -r scrollRestoration node_modules/next/dist/client/` 一處都沒有），
所以走瀏覽器原生還原。Chrome 的還原比 React 換頁早約 30ms，會把目的地的捲動位置
套到**還沒換掉的舊 DOM** 上。

真正致命的是第二層：`scrollRestoration` 存在**當下這個 history entry** 上。
在 `navigate` 事件裡設，設到的是「正要離開」的那一頁，目的地那一頁還是 `auto`。

```
navigate traverse (現在=auto)
SET scrollRestoration=manual        ← back-navigation.ts 有設
startViewTransition (現在=auto)     ← 讀回來還是 auto，設錯 entry 了
y=0 path=/ h=1587                   ← 內頁（h=1587）被 Chrome 捲到 0
```

**規則**：`scrollRestoration = "manual"` 要在**安裝當下**就設，不能等 traverse 才設。
後續 push 出來的新 entry 會繼承這個值。

**代價**：從站外按上一頁回來（跨文件、且沒進 bfcache）時瀏覽器不會還原捲動，
而我們的紀錄也隨 document 一起沒了，會停在最上面。要補得把位置寫進 `sessionStorage`，
用 `navigation.activation` 判斷是不是 traverse 進來的。目前刻意不補。

---

## 坑 2：`view-transition-name` 放在會跟著捲動的元素上，換頁時會飛過螢幕

**症狀**：背景色塊在換頁時整片滑過畫面，看起來像頁面自己捲了一大段。

**原因**：view transition 的位移動畫算的是**視口座標**。`absolute` 元素的視口座標
＝文件座標 − `scrollY`，所以兩頁 `scrollY` 差多少，元素就飛多少。

```
內頁@687 → 首頁@0
  舊: blue@-316  red@187  green@518
  新: blue@178   red@770  green@1262     ← 250ms 內垂直飛 490–744px
```

這不是調參數能解的，是幾何上的必然：捲動位置不同時，「同一個元素該在哪」沒有共同答案。

**規則**：只給**視口錨定**的元素 `view-transition-name`——`fixed` 或 `sticky`。
目前站上只有 `.site-logo`（`AppChrome` 的 fixed logo ↔ `PageTitleBar` 的 sticky logo）符合。
背景色塊試過，因為這條理由整個移除了。

同一時間畫面上不能有兩個同名元素，否則整個轉場被跳過。`display: none` 的不算，
所以 `AppChrome` 手機／桌機那兩顆 logo 用 `md:hidden` 互斥是安全的。

---

## 坑 3：上一頁會重播進場動畫

**症狀**：首頁捲到卡片區，進內頁再按上一頁，八張卡片會在眼前一張張淡入。

**原因**：`.card-enter` 是時間軸動畫（stagger 45ms）。按上一頁時卡片重新掛載，動畫重播。
首頁在頂端時卡片在摺線下看不到，捲到卡片區才會發現。實測 `currentTime`
`[260, 305, 350, 395, 440, 485, 530, 575]`。

**規則**：traverse 時在 `<html>` 掛 `data-restored`，CSS 把進場動畫關掉。
**清除時機只能認 `push`**——traverse 之後 Next 自己會補一次 `replace`，
拿它當清除時機會在卡片掛載前就把旗標清掉，等於沒設。

---

## 坑 4：`prettier --write styles/globals.css` 會重排整份檔案

那份檔案沒有照 prettier 的格式（色碼大寫、長 `--shadow-*` 不換行）。跑下去會產生
140 行的無關 diff。只改 CSS 的話用手改，不要跑 prettier。

---

## 怎麼驗

單元測試（`lib/back-navigation.test.ts`）餵的假 host **會模擬每個 entry 各自一份的
`scrollRestoration`**——坑 1 就是靠這個擋住的。改這支的時候不要把那層拿掉。

視覺行為得靠瀏覽器量。可用的手法：

- `document.getAnimations()` 過濾 `effect.pseudoElement` 開頭是 `::view-transition-group`，
  就知道這趟轉場實際動了哪些元素、`getKeyframes()` 給出起訖幾何
- CDP `Page.startScreencast` 逐格存圖，看得出殘影與跳動
- 每個 `requestAnimationFrame` 記 `scrollY / location.pathname /
  document.documentElement.scrollHeight / history.scrollRestoration`，
  `scrollHeight` 可以判斷當下畫面上是舊 DOM 還是新 DOM

**回歸要跑的六步**：首頁捲到 700 → 點卡片 → 內頁捲到 500 → 上一頁 → 下一頁 → 點頂列 logo。
期望 `700 → 0 → 500 → 700 → 500 → 0`。

**目的地一定要測「在頂端」那一種。** 坑 1 之所以漏掉，就是因為回歸案例的目的地
一直是首頁@700，捲動差距小看不出來；目的地在頂端才會整頁捲上去。
