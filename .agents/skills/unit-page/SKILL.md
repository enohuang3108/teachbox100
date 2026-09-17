---
name: unit-page
description: TeachBox100 單元頁的組裝規則 —— 註冊點順序、頁面骨架、breadcrumb、設定→開始、頂列鈕、全螢幕、store，以及使用者看得到的產品約定。新增一個教材頁或分類頁、改任何單元頁的結構之前讀。Read before adding or restructuring any unit or hub page in this repo.
---

# 單元頁

**視覺 token 在 `design-system`，測試矩陣在 `docs/testing.md`。這份只講一個單元由哪些零件組成、以及它欠使用者什麼。**

## 新增一個單元

順序固定，每一步都有東西依賴前一步：

1. **`app/pages.config.ts`** 的 `pagesConfig` 加 key：`path` / `imageSrc` / `blurDataURL` / `title` / `description` / `intro` / `guide?`。屬於某個分類就再加進 `hubs[x].children`。
   這是所有東西的源頭 —— 首頁卡牆、sitemap、llms.txt、OG 圖全部讀它。
2. **`lib/seo-content.ts`** 的 `pageSeo[key]`：`title` / `teaches` / `description` / `faq`（＋ `curriculum?` / `steps?`）。
   漏了 `buildMetadata` 直接 throw，而且 `app/llms.txt/route.ts` 對每個 key 無條件取 `seo.faq`，整條 route 500。
3. **`app/<route>/layout.tsx`**：`export const metadata = buildMetadata("<key>")`。
   page 是 `"use client"`，不能自己 export metadata，這層一定要有。
4. **`app/<route>/opengraph-image.tsx`**：三行樣板，所有路由一模一樣，照抄改 `pageKey`。
5. **封面圖** `public/images/covers/warm/<key>.webp`；說明區插圖放 `covers/cutout/` 同名檔，`lib/unit-illustration.ts` 會自動換路徑。`lib/pages-config.test.ts` 用 `existsSync` 檢查檔案真的在。
6. **`docs/testing.md`** 加一列：CI 保護的行為、需要真機驗收的部分。

sitemap 與 llms.txt 自動展開 `pages` 與 `hubs`，不必改。`app/sitemap.ts` 的 `LAST_MODIFIED` 是手動日期常數，內容真的變了才動它。

## 骨架

| 頁型 | 用什麼 | 實例 |
|---|---|---|
| 出題型教材 | `GamePageTemplate` | 金錢六頁、時鐘 |
| 自訂操作的教材 | `PageTemplate` ＋ 自拼 `TooltipProvider` | 轉盤、扭蛋機、一番賞、翻牌、九九乘法、計時器、噪音計 |
| 分類頁 hub | 兩者都不用，手寫版型 | `app/draw/page.tsx`、`app/coin/page.tsx` |

`PageTemplate` 的順序：三段 JSON-LD → `PageTitleBar` → `#game-stage`（帶 `data-unit={key}`）→ `data-stage-inner` → children → `UnitSeoSection`。傳了 `landing` 時換成下面「介紹頁」的順序。

**`UnitSeoSection` 必須出現在 SSR 的 HTML 裡。** 遊戲本體多半在 client 才畫得出來，搜尋引擎與 AI 爬蟲只讀得到這一段文字 —— 它不能包進 `next/dynamic({ ssr: false })` 或 hydrate 之後才出現的分支。滿版遊戲（大富翁）套不了模板，要在自己的 `layout.tsx` 手動補三段 schema 與這一段。

## 零件

### breadcrumb

`PageTitleBar` 畫。資料一律來自 `getBreadcrumbTrail`，跟 `BreadcrumbList` schema 同源 —— Google 要求畫面文字與結構化資料一致。

最後一節預設是 `<h1>`。分類頁內文已經有大標，傳 `asHeading={false}`，把 h1 留給內文那個。

路徑寫進 `pages.config` 之後 `AppChrome` 會自動讓位（`BARE_PATHS`）；沒寫進去就會有兩顆 logo。

### 介紹頁（landing）

先讓老師看懂這是什麼、再進工具的頁面用。`PageTemplate` 傳 `landing={{ startLabel, onStart? }}`：

- 進頁面只渲染 `UnitHero` ＋ `UnitSeoSection withIntro={false}`；頂列鈕先不給。按下開始鈕才換成 `#game-stage`，內容頁不再掛 SEO 區塊。
- `UnitHero` 大標取 `pages.config` 的 `headline ?? description`，說明放 `pages.config` 的 `intro` 全文（不截斷，所以要短而吸引人，操作細節寫進 FAQ）。`description` 還餵首頁卡片與 schema，要短標題就加 `headline`，不改 `description`。
- `onStart` 讓介紹頁那顆鈕直接做第一個動作（噪音計的「噓」直接開麥克風），不必進來再按一次。
- 狀態不記住：每次進頁面都從介紹頁開始。

實例：計時器、噪音計。

要先設定才能開始的頁，`landing.entered` 交給頁面控制：`onStart` 打開設定 Dialog，設定裡按開始才 `setEntered(true)`。Dialog 要放在 `PageTemplate` **外面** —— 介紹頁階段 children 不渲染。實例：轉盤（`app/draw/wheel/page.tsx`）。`GamePageTemplate` 內建同一套（設定只有一站「出題」，塞 `settings` 陣列），金錢五頁與時鐘不必自己組。大富翁走 `MonopolyGate`（在 layout 裡）組同一套。

### 設定 → 開始

需要老師先備料的頁才有。頁面端固定這四行：

```tsx
const [hydrated, setHydrated] = useState(false);
useEffect(() => setHydrated(true), []);
const [mode, setMode] = useState<"setup" | "play">("setup");
{!hydrated ? null : mode === "setup" ? <SetupPanel onStart={...} /> : <遊戲 />}
```

`hydrated` 這道閘是必要的：persist 的值要等 client 才有，直接渲染會 hydration mismatch。SEO 區塊在 `PageTemplate` 裡照常 SSR，只擋遊戲本體。

`SetupPanel` 介面固定 `({ onStart }: { onStart: () => void })`，自己讀寫該遊戲的 store，底部一顆 `<Button size="lg" disabled={!!error}>`。回設定走 `SettingsButton onClick={() => setMode("setup")}`；會丟掉進行中的局面時先跳確認。

配合介紹頁時，設定放進 Dialog，外殼一律用 `StepSetup`（`components/organisms/StepSetup.tsx`）：給 `steps`（每站 `label`／`icon`／`summary`／`done?`／`content`）、`blocker`、`startLabel`、`onStart`，它負責左側步驟側欄、捲動內容、底部固定列（一句總結＋上一步／下一步，最後一站才是開始、`blocker` 有值就擋住並顯示原因）。`DialogContent` 固定 `max-w-4xl gap-0 overflow-hidden p-0`。每站內容自己帶 `h3` ＋ `DialogDescription`。實例：大富翁（題庫／玩家／規則）、轉盤（名單／玩法）、翻翻配對（牌組／玩法）、計分板（組別／外觀）。

互斥選項用 `Tabs`（有各自內容）或長得一樣的 radiogroup（純單選）。載入慢的遊戲在開 Dialog 時背景預載程式碼與素材（`lib/monopoly/preload.ts`），按開始就不用等。

### 頂列鈕

`ACTION_BTN` 與 `Tip` 從 `GamePageTemplate` export 出來給非模板頁重用，六個自訂版型頁因此手感一致。

順序是硬約定：重新出題 → 設定 → 提示 → 音效 → **全螢幕永遠最後一顆**。外面包 `<TooltipProvider delayDuration={350} skipDelayDuration={600}>`。

`Tip` 裡面要包一層 `<span>`（動畫 icon 與 `FullscreenButton` 沒轉出 ref，`asChild` 定位不到）。每顆都要自己的 `aria-label`，讀螢幕器不靠 tooltip。只在 play 模式給：`actions={actions || undefined}`。

### 邊角控制

工具頁的主要操作貼螢幕邊，讓中間留給投影要看的東西：計時器是右下角直排圓鈕（最常按的開始鈕最大、放最下面、計時中變紅），噪音計是右邊置中的直立刻度尺。滿版的場景（扭蛋機的箱子）也走同一招：`fixed inset-x-0 top-16 bottom-0 [#game-stage:fullscreen_&]:top-0`，一般時讓出頂列、全螢幕時吃滿整個畫面。

**右下角操作鈕**是給老師站在大螢幕／觸控白板前按的：手指點得到、教室後排看得出按了什麼。有「一直會按的主動作」的工具頁都用這一組，頂列只留設定類。規格照計時器（`app/timer/page.tsx`）：

- 容器 `fixed right-6 bottom-6 z-(--z-sticky) flex flex-col items-center gap-3`，直排。
- 次要鈕 `size-16 rounded-full p-0`（`variant="outline"`）；主鈕只有一顆，`mt-2 size-24 rounded-full p-0 text-xl font-bold`，放最下面。按壓一律 `transition-transform duration-press ease-out active:scale-[0.97]`。
- 主鈕只放字（「開始」「旋轉」「搖一搖」），不加 icon —— 字就是它的可及名稱；次要鈕只放 icon，一定要給 `aria-label`。
- 動作不能做時 `disabled`，不要藏起來讓位置跳動；進入另一個階段（一番賞撕票）才整組收掉。
- 實例：計時器（時間／重設／開始）、扭蛋機（搖一搖）、一番賞（上一張／下一張／旋轉）。

一律包 `StageFixed`（`components/templates/StageFixed.tsx`），裡面再寫 `position: fixed`。全螢幕時 `[data-stage-inner]` 帶 transform 做等比縮放，直接寫在 children 裡的 fixed 會改以它為準、縮進舞台框；`StageFixed` portal 到沒有 transform 的 `#game-stage`，一般與全螢幕都貼著螢幕邊。內容區記得留出按鈕的寬度（計時器 `pr-28 sm:px-28`），手機上才不會蓋到。

### 全螢幕

三件套缺一不可：`id={GAME_STAGE_ID}`、`data-stage-inner`、`data-unit={key}`。

全螢幕只顯示 `#game-stage` 那棵子樹，portal 到 `body` 的浮層會被擋在外面。`dialog.tsx` 與 `popover.tsx` 都已經在全螢幕時改掛進 `document.fullscreenElement`；新增會 portal 的元件照同一招做。

`FullscreenButton` 量 `[data-stage-inner]` 算出 `--fs-scale` 等比縮放；per-unit 微調在 `styles/globals.css` 用 `#game-stage[data-unit="..."]`。不支援 element fullscreen（iOS Safari）時那顆鈕不渲染，不給壞掉的按鈕。

### store

`lib/<game>/store.ts`，一律 `create()(persist(..., { name: "<kebab-name>" }))`，一頁一個 localStorage key。存什麼、不存什麼見下面的約定表；計分板的分數與一番賞的卡池是刻意的例外，兩者的 FAQ 都有說明。改過持久化結構才需要 `version` + `migrate`。

音效開關是 `sound: boolean` + `setSound`，由 `SoundToggleButton` 驅動。

## 使用者看得到的約定

漏掉這些不會噴錯，只會讓網站前後不一致 —— 使用者說不出哪裡怪，但會覺得怪。

| 約定 | 內容 |
|---|---|
| 知道自己在哪 | 教材頁、分類頁與滿版遊戲都有麵包屑，一路點得回分類頁與首頁。學生專用畫面（搶答）刻意不給，那支手機只有一個任務 |
| 內容自己決定 | 名單、牌組、題庫、獎項、金額範圍由老師自訂，不寫死在程式裡 |
| 設定會記住 | 老師調過的設定留在這台裝置，下次打開還在；學生玩到一半的進度重整就沒了 |
| 回得去 | 「恢復預設名單／牌組」與「全部放回」是固定字眼，頂列 `aria-label`、剩餘數、抽完提示三處用同一個詞 |
| 有聲音就能關 | 會發出聲音的頁就給一顆開關，放頂列。開關本身也是設定，一樣要被記住 |
| 沒有壓力 | 教材類不計時、不計分、不排名、不扣分。答錯停留得比答對久，並把正解標出來，鼓勵重試 |
| 上限講明 | 名單 60 個、每項 20 字、翻牌 2–15 組、計分板 2–40 組。UI 上以「已用 / 上限」呈現；超限時錯誤訊息出現在「開始」上方，同時 disable 按鈕 |
| 免費免註冊 | 全站無登入、無付費牆、無廣告。學生搶答只要一個名字，不建帳號 |
| 可離線 | 素材要放 `public/` 的 images｜3d_model｜sounds｜lottie｜icons｜fonts 之一，用固定路徑才抓得到。離線導頁落在 `/offline` |
| 投影優先 | 全螢幕只把 `#game-stage` 丟進去，頂列與下方 SEO 區塊自然不入鏡 |
| 鍵盤走得完 | 主要流程要有鍵盤路徑。canvas 一律 `aria-hidden`，另外給 sr-only 的真按鈕清單當替代路徑 |
| reduced-motion | 收掉的是位移與 3D，結果照樣揭曉、資訊一個都不少 |
| 退回不重播 | 「上一頁」不重放進場動畫、捲動位置還原（`lib/back-navigation.ts`） |

目前站上有兩處還沒滿足這張表，新頁照表做就好：金錢六頁與時鐘頁會發聲但沒給開關（`GameAnswerSection` 無條件播放）；計時器有開關但沒被記住（`app/timer/page.tsx` 用 `useState`，是全站唯一沒 persist 的音效開關）。

**文案與實作是同一份契約。** 改了玩法就要改 `app/pages.config.ts` 的 `intro` 與 `lib/seo-content.ts` 的 `faq` —— 那份同時餵給頁面、搜尋引擎和 `llms.txt`，寫錯一次錯三個地方。刪掉一個設定就把講它的那題 FAQ 一起刪掉。

## 收尾

`pnpm test`、`pnpm lint`、`pnpm lint:tokens` 都乾淨。

動到按鈕文案、可及名稱或首頁卡牆時跑 `pnpm test:e2e` —— e2e 一律用中文可及名稱選取元素，文案改了就會紅。它跑在 port 3100 且 `reuseExistingServer: false`，開發用的 dev server 要先停掉。
