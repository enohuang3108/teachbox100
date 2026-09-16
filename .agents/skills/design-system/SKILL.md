---
name: design-system
description: TeachBox100 的紙感設計語言 —— 色彩、字級、層級、動效的 token 與挑選規則。寫或改任何 UI 之前讀：新元件、改版型、調顏色、加動畫、開新頁。Read before writing or changing any UI in this repo.
---

# TeachBox100 design system

**Token 的值住在 `styles/globals.css`，這份只講怎麼挑。** 值寫兩份就會有兩個版本。

## 動手前

1. 開 `styles/globals.css`，看 `@theme inline`（產生 utility）與 `:root` / `.dark`（值）。
2. 照下面四張表挑 token。表上沒有的角色，先問這個角色是不是真的新的 —— 多半是既有 token 換個名字。
3. 可按的東西補 `active:scale-[0.97]`；有位移的動畫在 `@media (prefers-reduced-motion: reduce)` 收掉位移、留住透明度。
4. 跑 `pnpm lint:tokens`。
5. 改到 `--paper` / `--ink` / `--brand-*` 的值 → 同步 `lib/design-tokens.ts`，`pnpm test` 會比對兩邊。

**完成條件：`pnpm lint:tokens` 乾淨，而且亮色與暗色都親眼看過。** 暗色還沒有切換 UI，
在 devtools 給 `<html>` 加 `class="dark"` 看。

## 色彩

品牌四色是從 `public/images/decor/blob-*.webp` **取樣**來的。重生那些色塊要重新取樣並同步
`:root`，否則卡片分類點會跟背景差一階。

| 要表達的 | 用 |
|---|---|
| 頁面底、卡片底 | `bg-paper`（頁）、`bg-card`（卡）、`bg-muted`（凹下去的區塊） |
| 次級底、選取態 | `bg-secondary` / `bg-accent`（hover） |
| 主要文字 / 次要文字 | `text-foreground`、`text-muted-foreground` |
| 分隔線 / 較實的邊 | `border-border`、`border-stone`、`border-ink` |
| 主要行動、焦點環 | `bg-primary`、`ring-ring` |
| 答對、答錯、提醒、資訊 | `text-success` / `bg-success-soft` + `text-success-ink`，另有 `danger`、`warning`、`info` 三組同樣結構 |

`-soft` 是底色、`-ink` 是壓在 soft 上的字色。**`text-warning` 當字色對比不足，要字就用 `text-warning-ink`。**

**顏色只出現在插圖、狀態、分類點。** 卡片本身一律 `bg-card` —— 八張卡各一個底色會變雜貨店。

canvas 與 particle 引擎吃不到 CSS 變數，那裡 `import { BRAND } from "@/lib/design-tokens"`。
DOM 與 inline SVG 走 class 或 `fill="var(--brand-red)"`，那條路徑才跟得上暗色。

## 字級

| 角色 | class |
|---|---|
| 品牌名 | `text-display` |
| 分類頁標題 | `text-hero` |
| 頁面副標 | `text-h1` |
| 區塊標題 | `text-h2` |
| 卡片標題 | `text-h3` |
| 內文 | `text-body` / `text-body-lg` |
| 說明、chip | `text-caption` |

每一級都自帶行高、字重、字距，**不必再補 `leading-*` `font-*` `tracking-*`**。

遊戲場景裡吃螢幕的大數字（計時器、九九乘法的題目、噪音計）是**逐場調過的**，
留在元件裡寫 `text-[clamp(...)]`。

中文行高一律 ≥ 1.7，這些 token 已經帶好了。中文沒有斷詞，桌機長句用
`<br className="hidden lg:inline" />` 斷在句號。

## 層級

跨頁的堆疊用 `z-(--z-sticky|--z-header|--z-overlay|--z-modal|--z-toast)`，值在 `:root`。
元件內部的區域堆疊（卡片上的徽章、進度條）留 `z-10`，那不是全站層級。

`components/atoms/shadcn/**` 與 `components/molecules/sheet.tsx` 是 vendored 的，
維持上游的 `z-50`，升級時 diff 才乾淨。

## 動效

| 元素 | 時長 |
|---|---|
| 按下回饋 | `duration-press` |
| hover、顏色變化 | `duration-hover` |
| 進場 | `duration-enter` |
| 退場 | `duration-exit`（比進場快：進場是使用者在等，退場是系統在回應） |
| 翻牌、轉場 | `duration-flip` / `duration-slow` |

曲線用 `ease-out`（進出場）、`ease-in-out`（畫面上的移動）、`linear`（等速）。
`--ease-out` / `--ease-in-out` 已覆寫成有力道的版本。

四條規則：

1. `transition` 列舉屬性（`transition-[transform,box-shadow]`），只動 transform 與 opacity。
2. hover 位移用 `hover:-translate-y-[3px]` —— scale 會讓 `next/image` 糊掉。
3. 進場從 `scale(0.95)` + `opacity-0` 起步，現實裡沒有東西從 `scale(0)` 冒出來。
4. 環境動畫（背景浮動、視差）要慢、幅度小、不旋轉，並接 `prefers-reduced-motion`。

鍵盤觸發的動作不做動畫 —— 一天按上百次的東西，動畫只會讓它變慢。

Tailwind v4 的 `hover:` 已內建包在 `@media (hover: hover)`。

## 已廢止（看到就改掉）

| 舊寫法 | 現在 |
|---|---|
| `bg-gray-100`、`text-gray-700`、`bg-blue-50`… | 語意 token |
| `bg-white` / `bg-black` | `bg-card` / `bg-paper` / `bg-ink` |
| `transition-all duration-300` | 列舉屬性 + `duration-hover` |
| `hover:scale-105` | `hover:-translate-y-[3px]` |
| `bg-gradient-to-br from-background via-muted/30` | `bg-paper` + 格線（`Background.tsx`） |
| `backdrop-blur` 卡片、`blur-xl` 光暈 | 實色 `bg-card`（紙感語言不用玻璃） |
| 常駐 `animate-pulse` 狀態點 | 刪掉 |
| 每個選項一個色相的 RadioGroup | `SELECTED_OPTION`（`lib/ui-classes.ts`） |
| 手寫 `text-[clamp(...)]` 的標題 | 字級 token |

## 相關檔案

- `styles/globals.css` —— 所有 token、keyframes、全螢幕版型
- `lib/design-tokens.ts` —— 給 canvas 的色票副本，由 `lib/design-tokens.test.ts` 守著
- `lib/ui-classes.ts` —— 跨元件共用的 class 組合
- `scripts/check-design-tokens.mjs` —— `pnpm lint:tokens` 跑的規則
- `docs/superpowers/specs/2026-09-02-home-redesign.md` —— 2026-09-02 改版的完整脈絡與生圖規範
