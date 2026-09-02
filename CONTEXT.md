# TeachBox100

免費的台灣國小生活技能互動教材，孩子在瀏覽器直接玩。這份是 glossary —— 只定義這個專案特有的詞。

產品文案與文件是繁中，程式識別字是英文，兩邊指同一件事時用下表的對應。

## 已知的踩雷點

| 狀況 | 說明 |
|---|---|
| `Coin` 涵蓋了鈔票 | `lib/types/types.ts` 的 `Coin` 與 `AVAILABLE_COINS` 含 1–2000 元，但新臺幣 100 以上是**鈔票**不是硬幣。上位詞應為 **Denomination**。`public/images/coins/` 同樣名不副實。**程式尚未更名。** |
| `Page` 不是 Next.js 的頁 | `app/pages.config.ts` 的 `Page` 指一個教材單元，跟框架的 `page.tsx` 路由撞名。正式詞是 **Unit**。**程式尚未更名。** |
| 色塊不叫 ball | 早期口語叫「球球」，形狀改成不規則之後正式詞是 **Blob**。`ball` 已無殘留。 |
| Character ≠ Avatar | **Character** 是可選的動物角色（資料），**PlayerAvatar** 是把它畫出來的元件。不要互換。 |

## 語言

### 平台

| 繁中 | English | 定義 |
|---|---|---|
| 單元 | Unit | 首頁一張卡片對應的一個可獨立開始的教學活動。目前八個。_避免_：教材、模組、遊戲、Page |
| 分類 | Category | 單元所屬的主題：金錢、時間、綜合。由路徑前綴推導，不是設定欄位 |
| 引導語 | Guide | 單元裡給老師或孩子的一句操作提示 |

### 金錢

| 繁中 | English | 定義 |
|---|---|---|
| 面額 | Denomination | 新臺幣的一種幣值。上位詞，涵蓋硬幣與鈔票 |
| 硬幣 | Coin | 面額 1、5、10、50 的金屬幣。_避免_：拿 Coin 泛指所有面額 |
| 鈔票 | Banknote | 面額 100 以上的紙鈔。_避免_：紙幣、bill、note |
| 等值 | Equivalent | 不同面額組合出相同總值的關係 |
| 找零 | Change | 實付金額減去應付金額的差額 |
| 金額上限 | MaxAmount | 出題時題目總額的上限，老師可調 |
| 金額範圍 | MoneyRange | 出題金額的上下界 |

### 大富翁

| 繁中 | English | 定義 |
|---|---|---|
| 格 | Tile | 棋盤上的一個位置，型別為 start／property／chance／fate／jail。_避免_：space、square、格子 |
| 地產 | Property | 可買賣、可蓋房的格 |
| 建設等級 | Build level | 0 為空地，1..maxHouses 為房子，maxHouses+1 為旅館 |
| 過路費 | Toll | 停在他人地產要付的錢，金額依建設等級。_避免_：租金、rent |
| 機會／命運 | Chance／Fate | 兩副內建卡牌，程式裡是 `deck` 的兩個值 |
| 題目 | Question | 老師從 Excel 匯入的一題，型別為 choice／boolean／short |
| 角色 | Character | 玩家可選的動物（水豚、貓熊…），純外觀，不影響規則 |
| 玩家頭像 | PlayerAvatar | 把 Character 畫出來、外圈帶玩家代表色的元件 |
| 暫停回合 | Skip turns | 玩家被罰停的回合數，原因是監獄或休息 |

### 品牌與視覺

| 繁中 | English | 定義 |
|---|---|---|
| Barkley | Barkley | 黑狗吉祥物。純黑剪影，眼睛是挖空的米白 |
| 色塊 | Blob | 從畫面邊緣切進來的不規則背景色形。_避免_：ball、球球、circle |
| 浮水印符號 | Glyph | 背景極低對比的數學符號（`$`、`＝`、`5:30`、`×`、`÷`） |
| 紙 | Paper | 全站底色系列：paper（頁面）／paper-warm（卡片）／sand（更深） |
