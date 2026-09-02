# UI 設計語言規範

> **完整規範在 [`docs/superpowers/specs/2026-09-02-home-redesign.md`](../../docs/superpowers/specs/2026-09-02-home-redesign.md)**
> —— design token、字級、版型、動效原則、生圖 prompt 與後製流程都在那裡。
> 這份只留「動手前必須知道的」和「已廢止的舊寫法」。
>
> 2026-09-02 改版。此檔先前記錄的是漸層底 + `hover:scale` 的舊語言，已全數作廢。

## 動手前必須知道的

### 顏色一律用 token，不寫死

品牌色票定義在 `styles/globals.css` 的 `:root`，shadcn 的語意 token（`--background`、`--card`、`--primary`…）都接到它上面。

```
--paper #FDFCF8   --paper-warm #F8F0E3   --sand #EDE6D8
--ink #020D15     --ink-soft #4A5560     --stone #BEB9B1
--brand-yellow #F8B003   --brand-red #CB2108
--brand-blue #02569B     --brand-green #2C5427
```

品牌四色是從 `public/images/decor/blob-*.webp` **實際取樣**出來的。重生色塊時要重新取樣並同步這裡，否則卡片分類點跟背景色塊會差一階。

### 中文行高 ≥ 1.7

`leading-5`（1.25）套在中文上會完全擠在一起。描述文字用 `leading-[1.75]`。

### 顏色只出現在插圖和分類點

卡片本身統一 `bg-card`（紙色）。八張卡各有各的底色會讓整頁變雜貨店。

### 動效四條

1. hover 位移用 `-translate-y-[3px]`，**不要 `scale`** —— 會讓 `next/image` 的圖糊掉
2. `transition` 一律列舉屬性（`transition-[transform,box-shadow]`），不要 `transition-all`
3. 可按的東西一定要有 `active:scale-[0.97]`，觸控裝置需要按下的回饋
4. 環境動畫（背景浮動、視差）要慢、幅度小、**不旋轉**，並接 `prefers-reduced-motion`

Tailwind v4 的 `hover:` 已內建包在 `@media (hover: hover)`，不必手動加。

## 已廢止（看到就改掉）

| 舊寫法 | 現在 | 為什麼 |
|---|---|---|
| `bg-gradient-to-br from-background via-muted/30 to-accent/20` | `bg-paper` + 格線（`Background.tsx`） | 漸層底跟紙感衝突 |
| `hover:scale-105` / `hover:scale-[1.02]` | `hover:-translate-y-[3px]` | scale 讓圖片糊 |
| `transition-all duration-300` | 列舉屬性 + `duration-200` | `all` 連 layout 都動；300ms 對 hover 太慢 |
| `<span className="... animate-pulse">` 狀態圓點 | 刪掉 | 常駐動畫不傳達任何狀態，只是噪音 |
| `backdrop-blur` 卡片 | 實色 `bg-card` | 紙感語言不用玻璃 |
| 光暈 `blur-xl` group-hover 效果 | 刪掉 | 同上 |
| Badge + `animate-pulse` 的 hero chip | 刪掉整個 chip | 資訊量為零的裝飾 |
| 卡片寫死 `style={{ width: 300 }}` | `w-full` | 在 grid 裡不 responsive |
| `text-4xl md:text-6xl` 之類的手寫階層 | `clamp()` | 見 spec 的字級表 |
