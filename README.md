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
