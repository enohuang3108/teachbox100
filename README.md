# Teachbox100

## 專案概述

Teachbox100 是一個互動式學習平台，旨在透過遊戲化的方式幫助使用者學習基礎數學和金融知識，例如硬幣面額的辨識與計算、時間概念等。

## 功能列表

- **硬幣學習模組:**
  - 認識不同面額的硬幣
  - 學習計算硬幣總值
  - 透過互動遊戲練習硬幣換算
- **時間學習模組:**
  - 學習認識時鐘和時間表示
  - 理解時間的基本概念（時、分、秒）
  - 互動式時間測驗

## 技術架構

- **主要框架與函式庫:**
  - [Next.js](https://nextjs.org/) (^15.3) - React 前端框架
  - [React](https://reactjs.org/) (^19.1) - UI 函式庫
  - [TypeScript](https://www.typescriptlang.org/) (^5.8) - JavaScript 超集
  - [Tailwind CSS](https://tailwindcss.com/) (^4.1) - CSS 框架
- **狀態管理:**
- **表單處理:**
  - [React Hook Form](https://react-hook-form.com/) (^7.55)
  - [Zod](https://zod.dev/) (^3.24) - 結構描述與驗證
- **UI 元件與工具:**
  - [shadcn/ui](https://ui.shadcn.com/) (基於 Radix UI) - 可重用 UI 元件庫 (從 `package.json` 中的 `@radix-ui/*` 推斷)
  - [Lucide React](https://lucide.dev/) (^0.454) - 圖示庫
  - [clsx](https://github.com/lukeed/clsx) (^2.1) & [tailwind-merge](https://github.com/dcastil/tailwind-merge) (^2.6) - Classname 管理工具
  - [Framer Motion](https://www.framer.com/motion/) (^12.6) - 動畫庫
  - [Sonner](https://sonner.emilkowal.ski/) (^1.7) - Toast 通知
  - [Canvas Confetti](https://github.com/catdad/canvas-confetti) (^1.9) - 慶祝動畫
- **日期與時間:**
  - [React Day Picker](https://react-day-picker.js.org/) (8.10)
  - [date-fns](https://date-fns.org/) (^4.1)
- **音訊:**
  - [Howler.js](https://howlerjs.com/) (^2.2)
- **其他:**
  - [NextThemes](https://github.com/pacocoursey/next-themes) (^0.4) - 暗色模式支援
  - [Input OTP](https://input-otp.rodz.dev/) (^1.4) - OTP 輸入元件
  - [PostHog](https://posthog.com/) - 產品分析 (從 `package.json` 推斷)

## 使用者與限制

**兩種使用者，需求不同，都要顧。**

- **孩子（4–12 歲，含特教生）** —— 真正在操作的人。點擊目標要大、文字要少、失敗不能有懲罰感、動效要慢而溫和。不識字的孩子也要能靠圖示猜出怎麼玩。
- **老師／家長** —— 決定要不要用的人。需要一眼看懂單元在教什麼、能自己調難度、大富翁能匯入自己的題庫。

不能違反的限制：

| 限制 | 為什麼 |
|---|---|
| 純前端、可離線 | 教室網路不穩。PWA（`@serwist/next`），狀態進 localStorage |
| 不需要帳號 | 孩子沒有 email，老師不想幫全班開帳號 |
| 大富翁是單一螢幕 | 老師電腦／投影幕上全班共用，玩家輪流上前操作。**不做多裝置連線** |
| 動效要克制 | 前庭敏感的孩子會不舒服。一定要接 `prefers-reduced-motion` |
| 繁體中文台灣用語 | 「新臺幣」不是「人民幣」，「鈔票」不是「紙幣」 |

## 開發慣例

- **首頁是 server component。** `app/page.tsx`、`PageDecor`、`ImageCard` 都沒有 `"use client"`。唯一的 client component 是 `ParallaxFallback`（無 markup，只掛 effect）。加東西前先想能不能維持
- **`app/pages.config.ts` 是首頁的唯一資料來源。** 新增單元 = 加一筆 + 放封面圖，格線與 sitemap 會自己接上
- **大富翁規則是純函式**（`lib/monopoly/rules.ts`），由 Zustand store 呼叫。測邏輯測那裡，不要測 store
- **設計 token 全在 `styles/globals.css`**，不要在元件裡寫死顏色
- 元件走 atoms / molecules / organisms / templates 分層；`components/atoms/shadcn/` 的元件被改過，不要用 CLI 直接覆蓋
- 圖片一律 webp、用 `next/image` 並帶 `blurDataURL`
- **換圖要換檔名**破 Next 圖片快取，不要砍 `.next`（dev server 跑著的時候砍會白畫面）
- commit message 走 conventional commits

## 延伸文件

| 文件 | 內容 |
|---|---|
| [`CONTEXT.md`](CONTEXT.md) | 領域詞彙 glossary（繁中／English／定義），含已知的命名踩雷點 |
| [`docs/superpowers/specs/2026-09-02-home-redesign.md`](docs/superpowers/specs/2026-09-02-home-redesign.md) | 設計語言、design token、動效原則、生圖 prompt 與後製流程 |
| [`docs/superpowers/specs/2026-06-01-monopoly-design.md`](docs/superpowers/specs/2026-06-01-monopoly-design.md) | 大富翁單元的設計決策 |
| [`.claude/memo/ui-style-guide.md`](.claude/memo/ui-style-guide.md) | 動手改 UI 前的速查 + 已廢止寫法對照表 |
