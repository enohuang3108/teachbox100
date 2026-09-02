# 首頁改版 — 設計語言與生圖規範

- 日期：2026-09-02
- 專案：TeachBox100（台灣互動式教學 PWA，Next.js 15 + React 19 + Tailwind v4 + shadcn/Radix）
- 狀態：已實作並上線於首頁；其他頁面尚未套用
- 取代：`.claude/memo/ui-style-guide.md`（舊的 gradient / scale hover 語言已廢止）

---

## 1. 設計方向

把原本「白底 + shadcn 預設灰藍 + 漸層」換成**有紙張質感的兒童教具檯面**。

- 暖白紙 + 淡格線當桌墊
- 不規則色塊從畫面邊緣切進來
- 數學符號當極低對比浮水印
- 黑色剪影吉祥物 Barkley 貫串全站

視覺來源是 Behance 上的 Monstrobots 兒童 app case study（暖紙底、大色塊、虛線路徑、粗體幾何字）。**沒有照抄的部分**：他們的怪獸角色與虛線導引路徑。虛線在我們的版型裡沒有足夠留白容納，會穿過內容，已放棄。

### 最關鍵的一條克制

**顏色只出現在插圖和分類點上，卡片本身統一紙色。**八張卡各有各的底色會讓整頁變雜貨店。

---

## 2. Design Tokens

全部定義在 `styles/globals.css`。色票用 hex 不用 oklch —— 品牌四色是從 `public/images/decor/blob-*.webp` **實際取樣**出來的，CSS 的色點必須跟生成圖完全同色，否則分類點跟背景色塊差一階會看起來很髒。**若重生色塊，必須重新取樣並同步更新這裡的 hex。**

### 2.1 色彩

| Token | 亮色 | 暗色 | 用途 |
|---|---|---|---|
| `--paper` | `#FDFCF8` | `#14120E` | 頁面底 |
| `--paper-warm` | `#F8F0E3` | `#1E1B16` | 卡片底、區塊底 |
| `--sand` | `#EDE6D8` | `#2A251E` | 更深卡底、chip、input |
| `--stone` | `#BEB9B1` | `#6B655C` | disabled、分隔 |
| `--ink` | `#020D15` | `#F2EDE4` | 主文字、按鈕底 |
| `--ink-soft` | `#4A5560` | `#A8A196` | 描述文字 |
| `--brand-yellow` | `#F8B003` | 同 | primary、金錢主題 |
| `--brand-red` | `#CB2108` | `#E4522F` | 強調、destructive |
| `--brand-blue` | `#02569B` | `#3E92D6` | 時間主題 |
| `--brand-green` | `#2C5427` | `#6FA24E` | 綜合主題、成功 |
| `--grid-line` | `rgb(2 13 21 / 0.045)` | `rgb(255 255 255 / 0.04)` | 背景格線 |
| `--ghost` | `rgb(2 13 21 / 0.04)` | `rgb(255 255 255 / 0.035)` | 浮水印符號 |

shadcn 的語意 token（`--background`、`--card`、`--primary`…）全部接到上面這組。**暗色刻意用暖調近黑，不用中性灰**，不然跟亮色不像同一個品牌。

分類配色（只用在卡片右下的小圓點）：`/coin` → yellow、`/clock` → blue、其他 → green。從路徑推導，不在 `pages.config` 多養欄位（`components/molecules/ImageCard.tsx` 的 `categoryOf`）。

### 2.2 字體

```
--font-display / --font-sans:
  var(--font-nunito), var(--font-noto-tc), ui-sans-serif, system-ui, sans-serif
```

- **Nunito** 負責拉丁字母與數字（圓潤幾何）
- **Noto Sans TC** 補中文字重，`preload: false`（中文字檔大，交給 `display: swap` 後補）
- 兩支都經 `next/font/google` 在 `app/layout.tsx` 載入，掛在 `<body>` 的 `variable` 上

### 2.3 字級

| 角色 | 尺寸 | 行高 | 字重 | 字距 |
|---|---|---|---|---|
| display（品牌名） | `clamp(2.75rem, 6vw, 4.5rem)` | 1.02 | 900 | -0.03em |
| h1 副標 | `clamp(1.5rem, 3.2vw, 2.25rem)` | 1.3 | 700 | — |
| h2（區塊標題） | `clamp(1.5rem, 3vw, 2rem)` | tight | 800 | -0.01em |
| h3（卡片標題） | `1.25rem` | snug | 700 | — |
| body-lg（hero 副標） | `1.125rem` → `lg:1.25rem` | 1.75 | 400 | — |
| body | `1rem` | 1.75 | 400 | — |
| caption / chip | `0.875rem` | 1.5 | 600 | — |

**中文行高一律 ≥ 1.7。** 改版前卡片描述是 `leading-5`（1.25），中文完全擠在一起。

**中文沒有斷詞**，長句會斷在詞中間（「的能／力」）。桌機用 `<br className="hidden lg:inline" />` 強制斷在句號。注意 JSX 的換行縮排會被收成一個空白，句子要寫在同一行或用 `<br/>` 隔開。

### 2.4 間距與圓角

- 節奏走 8 的倍數，直接用 Tailwind 內建級距，**不新增 spacing token**
- 容器：`mx-auto w-full max-w-[1200px] px-5 md:px-8`
- 區塊上下留白：`py-14` 手機 / `py-24` 桌機
- 卡片格 gap：`gap-5` 手機 / `md:gap-8`
- `--radius: 0.75rem`（原本 0.375rem 對兒童教材太銳利）、卡片 `1.25rem`、按鈕與 chip 全膠囊
- **Hero 不做 100vh**，桌機高度控在 560–640px，讓第一排卡片露出來

### 2.5 動效

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);   /* 覆寫 Tailwind 內建，內建太軟 */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--duration-press: 0.14s;  --duration-hover: 0.2s;  --duration-enter: 0.26s;
```

Tailwind v4 的 `hover:` 本身已包在 `@media (hover: hover)` 裡（已驗證編譯輸出），不必手動加。

---

## 3. 版型

```
Hero        桌機 7:5 兩欄（左文右狗）／手機單欄狗在上
            pt-24 讓出左上角固定 logo 的高度
教材區      grid 1 / 2 / 3 / 4 欄
Footer      paper-warm 橫帶 + 趴姿 Barkley + 三個事實 chip
```

### 卡片規格

`--paper-warm` 底、`rounded-[1.25rem]`、`ring-1 ring-black/[0.06]`、封面 `aspect-[4/3]` `rounded-[0.875rem]`、標題 20/700、描述 14/1.75、右下分類點。

**卡片寬度必須是 `w-full`**。改版前寫死 `style={{ width: 300 }}`，在 grid 裡不 responsive。

---

## 4. 動效原則

> 這一節是踩過坑之後寫的，不是理論。

### 互動動效

| 元素 | 做法 | 理由 |
|---|---|---|
| 卡片 hover | `-translate-y-[3px]` + shadow，200ms `ease-out` | **不要用 `scale`**，會讓 `next/image` 的封面糊掉 |
| 卡片 / 按鈕 press | `active:scale-[0.985~0.97]`，140–150ms | 觸控裝置需要按下的回饋 |
| 卡片進場 | `.card-enter` stagger，每張 delay `index * 45ms` | 八張同時 pop 進來很生硬 |
| transition 屬性 | 一律列舉（`transition-[transform,box-shadow]`） | 不要 `transition-all` |

### 環境動效（背景色塊浮動 `.blob-float`）

- 只動 `transform`，`translate3d(0, -8px, 0)`，週期 18–26s
- 每塊給不同 duration + **負的 `animation-delay`**，載入時就處在週期不同位置，不會整片一起呼吸
- **刻意不做旋轉。** 旋轉是前庭不適最典型的觸發因子，捲動時背景又在轉會加乘

### 捲動視差（`.decor-parallax`）

用 CSS scroll-driven animation，不掛 scroll 事件（完全不上主執行緒）。三個必須寫對的地方：

1. **時間軸用 `view(block)` 不是 `scroll(root)`。** `scroll()` 把整份文件的捲動長度當時間軸，靠頂端的元素在離開畫面前只跑完約三成位移，肉眼看不出來。`view()` 讓每個元素在自己通過畫面的那段期間跑完整段。
2. **`@supports (animation-timeline: view())` 不能拿掉。** 不支援的瀏覽器會把它當一般動畫，`animation-duration` 算成 `0s` 加上 `both` 填充，元素會**直接跳到終點卡死**，整片背景永久偏移。
3. **外層負責視差、內層負責浮動，必須分兩層。** 疊在同一元素上，後宣告的 `transform` 會整個蓋掉前一個。
4. 容器用 `overflow-clip` 不用 `overflow-hidden` —— `hidden` 會生出 scroll container，干擾時間軸解析。

**位移一律同向（全部為正，往下漂）。** 正負交錯讓元素互相穿越視覺上比較有層次，但同一視野裡同時有東西往上、有東西往下，前庭系統會收到矛盾訊號，是暈眩主因。只讓速率不同（50–80px），實際可見位移 17–38px。

元素若在頁面最頂或藏在 footer 後面，它從頭到尾走不完一次「通過畫面」的行程，視差等於零 —— 位置要留在頁面中段。

### Firefox fallback（`components/atoms/ParallaxFallback.tsx`）

Firefox 穩定版還沒開 scroll-driven animations（藏在 `layout.css.scroll-driven-animations.enabled` 後面）。fallback 做成**沒有 markup 的獨立 client component**，`PageDecor` 才能維持 server component。

- Chrome / Safari 走原生路徑，`CSS.supports` 直接 return，連 listener 都不掛
- **`getBoundingClientRect()` 會把 transform 算進去**，直接拿去算進度會形成回饋迴圈（位移被自己壓掉一截），這是 Chrome / Firefox 對不起來的原因。要扣掉上一幀套的量：`layoutTop = rect.top - applied`
- 直接寫 `el.style.transform`，**不要**在共同父層改 CSS 變數（變數會沿繼承鏈讓所有子元素重算樣式）
- `{ passive: true }` + `requestAnimationFrame` 合併，一幀最多算一次
- 先一次讀完所有 rect 再一次寫完所有 transform，讀寫交錯會每個元素各觸發一次強制回流

### 無障礙

`prefers-reduced-motion: reduce` 下 `.card-enter` / `.blob-float` / `.decor-parallax` 全部 `animation: none`，fallback 也直接 return。

---

## 5. 生圖規範

吉祥物是黑狗 **Barkley**。所有圖用 `codex exec` 產生。

### 5.1 唯一的風格規則

> **這個品牌的每個物件都是「一塊實色 + 把細節挖空」。**
> Barkley 是實心黑，眼睛挖成米白。就這樣，沒有別的。

推論到所有道具：

- 硬幣 = **一塊**實心金色，數字挖成米白。沒有外環、沒有內圈、沒有邊框、沒有斜角、沒有高光、沒有描邊、沒有深一階的金色
- 鈔票 = **一塊**實心綠色，最多一個挖空的元素
- 形狀**粗且手繪感**，圓形要有輕微不規則邊緣，不能是幾何正圓
- 點綴是粗實心圓點和短粗十字，**不是**細線四角星
- 每塊實色都帶相同的 risograph 顆粒

**明令禁止**：有外環和陰影數字的 clip-art 硬幣、雕花鈔票邊框、細線四角星、髮絲線、任何描邊、漸層、陰影、3D、寫實。

### 5.2 可重用的 prompt 模板

生新圖時，把下面整段貼上，再接場景描述。參考圖用 `style-ref.png`（Barkley + 四塊色塊拼成一張）。

```
Generate N card cover images for a Taiwanese children's education website.
The attached reference shows this brand's existing visual language: the black dog mascot
Barkley on the left, and colored blobs on the right. Everything must belong to that family.

=========== THE ONE STYLE RULE (applies to every image) ===========
Every object in this brand is ONE SOLID FLAT SHAPE with details KNOCKED OUT of it.
Barkley is a solid black shape with his eyes knocked out in cream. Nothing more.
So: a coin is ONE solid gold shape with its numeral knocked out in cream — no rim, no ring,
no inner circle, no border, no bevel, no highlight, no outline, no darker shade of gold.
Apply the same logic to every prop: one solid color, details cut out of it in cream.

FORBIDDEN, in every image: clip-art coins with outer rings and shaded numerals; engraved
banknote frames; thin four-point sparkle stars; hairlines; outlines or strokes of any kind;
gradients; drop shadows; 3D; photo realism.

SHAPE LANGUAGE: chunky and slightly HAND-DRAWN, like the blobs in the reference. Circles are
hand-drawn with gently uneven edges, never geometrically perfect. Accent marks are fat solid
dots and thick short crosses. Every filled shape carries the same subtle risograph print grain.

COLORS (flat, exactly these, no tints or shades):
cream #F8F0E3 · black #0D0D0D · gold #F8B003 · green #2C5427 · red #CB2108 · blue #02569B

CANVAS (every image): 4:3 landscape, 1024x768. Background is cream #F8F0E3 edge to edge with a
very faint square graph-paper grid (black at ~4% opacity).

BARKLEY (every image): he STANDS UPRIGHT ON HIS HIND LEGS like a little person and uses his
two front paws as HANDS. He is a pure black silhouette with two cream eyes.
LEGIBILITY: his black paws must read clearly ON TOP of colored props — the color stays visible
around them. Always keep a clear gap between his arms and his torso. Never let paws, arms and
body merge into one unreadable black mass.

FRAMING (every image): Barkley fully inside the frame, never cropped at the edge. 5 objects
maximum, generous empty paper. Shown at ~260px wide, so no fine detail.
NO TEXT anywhere, except numerals knocked out of coins / clock faces.

=========== THE SCENES ===========
<每張一段：單元名、輸出路徑、Barkley 在做什麼（擬人動作）、畫面上有哪些物件>

If you do NOT have an image generation tool, reply exactly NO_IMAGE_TOOL. Do not hand-write SVG.
```

### 5.3 擬人化是重點

第一版封面是「狗在旁邊看著錢」，太被動、太像素材庫。改成 **Barkley 用兩隻前爪當手、做出人的動作**——他不是在旁邊看，是在示範這個單元要學的事。

已上線的八個場景：

| 單元 | Barkley 在做什麼 |
|---|---|
| 認識新臺幣 | 雙爪把 10 元舉過頭頂端詳 |
| 金錢等值換算 | 兩臂張開各托天秤一端，50 元 vs 五枚 10 元 |
| 計算金錢價值 | 一爪按藍色計算機、一爪指著桌上排開的硬幣 |
| 付款 | 把一枚硬幣推過櫃台 |
| 購物 | 推購物車，另一爪伸手拿貨架上的蘋果 |
| 找零 | 攤開雙爪接住從上方落下的硬幣 |
| 學習讀時鐘 | 抓住大時鐘的長針往回轉，身體被帶得傾斜 |
| 大富翁 | 一爪高舉剛擲出骰子，骰子還在空中 |

### 5.4 吉祥物姿勢

| 檔案 | 姿勢 | 用途 |
|---|---|---|
| `mascot/barkley.webp` | 正面坐姿抬頭 | Hero 主視覺 |
| `mascot/barkley-lying.webp` | 趴姿 | Footer（橫向剪影配橫帶版型，也讀得出「到底了」） |

### 5.5 codex 呼叫方式

```bash
cat prompt.md | codex exec -s workspace-write --skip-git-repo-check -i style-ref.png
```

三個會卡住的點：

1. **prompt 一定要走 stdin。** `-i/--image` 是 variadic，把 prompt 當位置參數放後面會被它吞掉，出現 `Reading prompt from stdin... No prompt provided`
2. **一定要 `-s workspace-write`**，預設 read-only 存不了檔。`--full-auto` 這個 flag 在 `exec` 子命令不存在
3. prompt 尾巴一定要加 `NO_IMAGE_TOOL` 那句，否則它會改用 ImageMagick/PIL 自己畫一張很醜的圖交差

用量限制大約每小時整點重置，錯誤訊息裡的 "try again at H:59" 要等真的過了整點才放行。

### 5.6 後製流程（不可省略）

生出來的圖**不會**置中，四周留白也不照 prompt 講的比例。

```python
from PIL import Image
import io, base64

def solid_bbox(im, t=200):                       # 忽略邊緣的淡淡雜訊
    return im.split()[3].point(lambda v: 255 if v > t else 0).getbbox()

# 透明吉祥物：裁到實體範圍 → 置中到正方形 → lossy webp
im = Image.open(src).convert("RGBA")
im = im.crop(solid_bbox(im))
S, inner = 1024, int(1024 * 0.9)
w, h = im.size; sc = inner / max(w, h)
im = im.resize((round(w * sc), round(h * sc)), Image.LANCZOS)
canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
canvas.paste(im, ((S - im.size[0]) // 2, (S - im.size[1]) // 2), im)
canvas.save(dst, "WEBP", quality=90, method=6)

# 卡片封面：轉 webp + 產生對應的 blurDataURL
cov = Image.open(src).convert("RGB")
cov.resize((1024, 768), Image.LANCZOS).save(dst, "WEBP", quality=86, method=6)
buf = io.BytesIO(); cov.resize((8, 6), Image.LANCZOS).save(buf, "PNG")
blur = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
```

- 顆粒圖 lossy 壓縮效果差，色塊用 640px / q80，封面用 1024×768 / q86
- **無損 webp 不要用在 AI 生成圖**：邊緣抗鋸齒和雜訊會讓檔案大好幾倍
- `blurDataURL` 一定要跟著換，不然載入時會閃前一張圖的顏色

### 5.7 換圖必須換檔名

覆蓋同名 webp 之後畫面不會更新 —— Next 的圖片最佳化快取還吃著同一個 URL。**改檔名破快取**（例：`coin-introduction-v2.webp`），不要砍 `.next`（dev server 跑著的時候砍 `.next` 會白畫面）。

---

## 6. 檔案地圖

```
styles/globals.css                        全部 token、keyframes、utility
app/layout.tsx                            字體載入、overflow-x-hidden、theme-color
app/page.tsx                              首頁版型（server component）
app/pages.config.ts                       八個單元的 path / 封面 / blurDataURL / 文案
components/atoms/Background.tsx           全站底層紙 + 格線（fixed）
components/atoms/PageDecor.tsx            色塊 + 浮水印，資料驅動（server component）
components/atoms/ParallaxFallback.tsx     Firefox 視差 fallback（client，無 markup）
components/molecules/ImageCard.tsx        卡片
public/images/covers/*.webp               八張單元封面
public/images/decor/blob-*.webp           四塊背景色塊（品牌四色的取樣來源）
public/images/mascot/barkley*.webp        吉祥物姿勢
public/icons/logo-tile.webp              白底圓角磚 logo（favicon / OG / JSON-LD）
public/icons/favicon-{32,180,192,512}.png 各尺寸分頁與桌面 icon
public/icons/logo-transparent.webp       去背 logo（頁面左上角 FaviconButton）
```

### Logo 的兩個版本

同一個 mark（Barkley 從金色箱子探頭、箱身挖空「100」）出兩份：

- **分頁列 / 桌面捷徑**：白底 + 20% 圓角磚，logo 內縮 11%。**透明背景的 icon 在深色瀏覽器介面上會整個消失**，所以一定要有底
- **頁面左上角**：去背，直接站在紙色底上

`appInfo.imageSrc` 必須是 **webp** —— `app/opengraph-image.tsx` 把 `Content-Type` 寫死成 `image/webp`。

---

## 7. 已知限制與未完成

- **其他頁面尚未套用新語言。** token 是全站生效的（`--background`、`--card`、`--radius` 都換了），但 `/coin/*`、`/clock/*`、`/monopoly` 的版型和元件還是舊寫法
- **暗色模式沒有切換器。** token 已備齊，但沒有 UI 可以切
- **OG 圖還是舊的。** `app/**/opengraph-image.tsx` 沒跟著換
- **Firefox 的 fallback 順滑度天生差一點。** 原生走合成執行緒依實際捲動位置取樣，JS 要等 scroll → rAF，快速捲動時可能慢一幀。位置會對
- **OG 圖尺寸與宣告不符。** `app/opengraph-image.tsx` 宣告 1200×675，實際送出的是 512×512 的方形 logo。改版前就這樣，未處理
- **沒跑過 `next build` 驗證。** 改版全程 dev server 開著，`tsc --noEmit` 與 `oxlint` 有過（3 個 warning 是 monopoly / coin-buy 的既有問題）
