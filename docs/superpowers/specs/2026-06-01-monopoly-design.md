# 大富翁教學單元 — 設計文件

- 日期：2026-06-01
- 專案：TeachBox100（台灣互動式教學 PWA，Next.js 15 + React + Tailwind v4 + shadcn/Radix）
- 狀態：設計已確認，待寫實作計畫

## 1. 目標與情境

在 TeachBox100 新增一個「大富翁」教學單元，作為課堂團體遊戲。

- **使用情境**：單一螢幕（老師電腦／投影幕），全班看同一畫面，玩家輪流上前操作。純前端、可離線，符合現有 PWA 架構。**不做**多裝置連線。
- **核心需求**：
  - 老師可匯入固定格式的 Excel 題庫（混合題型）。
  - 內建機會／命運卡與監獄格。
  - 最多 20 位玩家。
  - 老師可定義遊戲設定（人數、起始金、骰子、結束條件等），皆有預設值。
  - 玩家買地／蓋房前需先抽題並答對。
  - 金錢制大富翁：買地、蓋房、收過路費，依結束條件結算，錢最多者勝。
  - 全部狀態（題庫、設定、進行中牌局）持久化到 localStorage，重整可續玩。

## 2. 架構決策

- **狀態管理**：Zustand + `persist` middleware（localStorage）。核心規則寫成純函式（`rules.ts`），由 store 呼叫，兼顧 persist 便利與邏輯可測試性。
- **Excel 解析**：`xlsx`（SheetJS）+ `zod` 驗證。
- **測試**：Vitest（新增），集中測純函式（規則 + 解析），目標 80%+ 覆蓋率。
- **新增相依**：`zustand`、`xlsx`、`vitest`（+ coverage）。
- UI 沿用既有 shadcn 元件、`useSound`、`canvas-confetti`、`motion`、`use-mobile`，並接上首頁 `pages.config.ts`。

### 檔案結構

```
app/monopoly/
  page.tsx                 # 主頁（"use client"），依 phase 組合畫面
lib/monopoly/
  types.ts                 # 所有型別
  board.ts                 # 固定台灣主題環狀棋盤資料
  cards.ts                 # 固定機會/命運卡資料
  rules.ts                 # 純函式遊戲規則（擲骰、移動、買地、收租、抽卡、結束判斷）
  excel.ts                 # xlsx 解析 + zod 驗證 → Question[]
  store.ts                 # Zustand store（persist），串接 rules.ts
components/monopoly/
  Board.tsx                # 環狀棋盤 + 格子
  PlayerTokens.tsx         # 玩家代幣（同格疊放/微偏移）
  Dice.tsx                 # 骰子（motion 動畫）
  QuestionDialog.tsx       # 答題彈窗
  CardDialog.tsx           # 機會/命運翻卡彈窗
  SetupPanel.tsx           # 設定表單 + Excel 匯入/下載範本
  PlayerPanel.tsx          # 側邊玩家金錢/資產列表（可捲動）
  GameOverDialog.tsx       # 結算排名
```

邏輯分層：`rules.ts` 為純函式（吃舊 state、回傳新 state，不可變）；`store.ts` 負責串接 + persist + 觸發動畫/音效；UI 元件只讀 store 與派發 action。

**亂數注入**：擲骰、抽題、抽卡的隨機來源以參數注入 `rules.ts`（例如 `roll(state, rng)`），預設用 `Math.random`，測試時注入固定序列，確保純函式可決定性測試。

## 3. 資料模型

```ts
// 題目（Excel 匯入）
type QuestionType = "choice" | "boolean" | "short";
interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];      // 選擇題用
  answer: string;          // 選擇題：選項文字；是非題：對/錯；簡答：參考答案
  explanation?: string;
}

// 棋盤格子（固定內建）
type TileType = "start" | "property" | "chance" | "fate" | "jail";
interface Tile { index: number; type: TileType; name: string; }
interface PropertyTile extends Tile {
  type: "property";
  price: number;
  toll: number[];          // [空地, 1棟, 2棟, 3棟...]
  houseCost: number;
  maxHouses: number;
}

// 機會/命運卡（固定內建）
type CardEffect =
  | { kind: "money"; amount: number }      // 罰款(負)/獎金(正)
  | { kind: "move"; steps: number }        // 前進/後退 N 格
  | { kind: "moveTo"; tileIndex: number }  // 前進到指定地標
  | { kind: "jail" }
  | { kind: "skip" };                      // 暫停一回合
interface Card { id: string; deck: "chance" | "fate"; text: string; effect: CardEffect; }

// 玩家
interface Player {
  id: string;
  name: string;
  color: string;
  money: number;
  position: number;
  ownedTiles: number[];
  houses: Record<number, number>;   // tileIndex -> 房子數
  skipTurns: number;                // >0 暫停回合數
  bankrupt: boolean;
}

// 老師設定（皆有預設值）
interface GameSettings {
  playerCount: number;     // 2..20，預設 4
  startingMoney: number;   // 預設 15000
  diceCount: 1 | 2;        // 預設 2
  passStartBonus: number;  // 預設 2000
  endCondition:
    | { type: "time"; minutes: number }      // 預設 40
    | { type: "moneyGoal"; amount: number }  // 預設 50000
    | { type: "lastOneStanding" }
    | { type: "laps"; count: number };
}

// 整體狀態（persist 到 localStorage）
type PendingAction =
  | { kind: "buyQuestion"; tileIndex: number; question: Question }   // 買地需答題
  | { kind: "buildQuestion"; tileIndex: number; question: Question } // 蓋房需答題
  | { kind: "confirmBuy"; tileIndex: number }                        // 答對後確認買/跳過
  | { kind: "confirmBuild"; tileIndex: number }
  | { kind: "drawCard"; deck: "chance" | "fate"; card: Card }
  | null;

interface GameState {
  phase: "setup" | "playing" | "gameover";
  settings: GameSettings;
  questions: Question[];
  players: Player[];
  currentPlayerIndex: number;
  lastRoll: number[] | null;
  pendingAction: PendingAction;
  startedAt: number | null;     // 計時用
  lapsByPlayer: Record<string, number>; // 經過起點次數（laps 結束條件）
  log: string[];
}
```

## 4. 遊戲流程（回合機制）

```
1. 輪到 currentPlayer
   └ 若 skipTurns > 0：skipTurns--，log「暫停一回合」，換下一位
2. 擲骰子（diceCount 顆）→ lastRoll，Dice 動畫 + 音效
3. 移動：position = (position + 點數和) % N
   └ 繞過/踩到起點 → money += passStartBonus，lap++，log
4. 依落點 type 觸發 pendingAction：
   - start：無事件
   - property：
       無主 → buyQuestion（隨機抽題）→ 答對 → confirmBuy（錢夠才可買；買則 money -= price）
                                      → 答錯 → 不能買（無懲罰）
       自己的地 → buildQuestion → 答對且錢夠且未滿 → houses++，money -= houseCost
       別人的地 → 自動付過路費 toll[houses]：付款者 money -= toll，地主 money += toll
                  （付不出 → 破產）
   - chance / fate → drawCard → 套用 effect
   - jail（單一格）→ skipTurns = 1
5. 結束回合 → 檢查結束條件 → 未結束則換下一位（跳過 bankrupt）
```

### 卡片連鎖落點

卡片造成移動（`move` / `moveTo`）後，**完整結算落點格子事件，含可再次抽卡（連鎖）**——這被視為「運氣好」，刻意不擋。程式中僅設一個保險上限（連鎖達 10 次強制停止並記 log），純粹防止極端無限迴圈，正常遊玩不會觸及。

### 結束條件（每回合結束時檢查）

- `time`：`now - startedAt >= minutes` → 錢最多者勝。
- `moneyGoal`：任一玩家 `money >= amount` → 立即結束，該玩家勝。
- `lastOneStanding`：僅剩 1 位非破產 → 該玩家勝。
- `laps`：任一玩家 `lapsByPlayer >= count` → 錢最多者勝。
- 結算依現金排名；同分比資產總值（地價 + 房子投入）。

### 破產處理

玩家需付款但金額不足 → `bankrupt = true`，`ownedTiles` / `houses` 釋出為無主地，後續輪轉跳過該玩家。

### 防呆

- 擲骰、抽題、買地/蓋房期間鎖住按鈕，避免重複點擊。
- 所有 action 回傳新物件、不改舊 state（不可變）。

## 5. Excel 格式與匯入

**固定欄位（第一列表頭，繁中）：** `題型｜題目｜選項A｜選項B｜選項C｜選項D｜正確答案｜解析`

| 題型 | 題目 | 選項A | 選項B | 選項C | 選項D | 正確答案 | 解析 |
|------|------|-------|-------|-------|-------|----------|------|
| 選擇 | 台灣最高的山是？ | 玉山 | 雪山 | 合歡山 | 阿里山 | A | 玉山海拔3952公尺 |
| 是非 | 台北是台灣的首都 |  |  |  |  | 是 | … |
| 簡答 | 台灣最長的河川？ |  |  |  |  | 濁水溪 | … |

**解析規則（`excel.ts`）：**
- `xlsx` 讀第一個工作表 → row 物件。
- `zod` 逐列驗證：
  - `題型` 必填，須為 `選擇／是非／簡答` → `choice/boolean/short`。
  - 選擇題：至少 選項A、選項B；`正確答案` 為 `A/B/C/D` 或選項文字，且該選項存在。
  - 是非題：`正確答案` 為 `是／否`（或 對／錯）。
  - 簡答題：`正確答案` 為文字。
  - `題目`、`正確答案` 必填；`解析` 選填。
- 驗證失敗 → 收集**所有**錯誤列 `{ ok:false, errors:[{row, message}] }`，UI 顯示逐列錯誤，老師修正後重匯（fail fast、不靜默吞錯）。
- 成功 → `Question[]` 存入 store（persist）。

**匯入 UI（SetupPanel）：**
- 檔案上傳（接受 `.xlsx`/`.xls`）。
- 「下載範本」按鈕：前端用 `xlsx` 即時產生含表頭與範例列的 `.xlsx`。
- 成功顯示「已載入 N 題」並可預覽前幾題。

**簡答題判定：** 無法可靠自動比對 → 答題後顯示參考答案＋解析，由**老師人工按「答對／答錯」**。選擇／是非題自動判定。

## 6. 畫面與 UI

依 `phase` 切換：

- **setup**：`SetupPanel` 全頁——Excel 上傳 + 下載範本、設定表單（人數/起始金/骰子數/經過起點獎勵/結束條件，皆預設值，用 shadcn `Input`/`Select`/`Slider`）、玩家名稱與顏色、「開始遊戲」（需已載入題庫）。
- **playing**：三區塊版面（橫向大螢幕優先）
  - 頂列：目前玩家、回合/計時/目標進度、選單（重開/設定）。
  - 左：環狀棋盤 `Board` + 玩家代幣，中央 `Dice` + 「擲骰子」。
  - 右：`PlayerPanel`（可捲動玩家金錢/資產，目前玩家高亮）+ 事件紀錄 log。
  - 彈窗（shadcn `Dialog`）：`QuestionDialog`、`CardDialog`（motion 翻卡）、買地/蓋房確認。
- **gameover**：`GameOverDialog` 顯示排名與最終金額，「再玩一局／回設定」。

**20 人呈現：** 代幣用小圓點＋編號，同格疊放/微偏移；20 色預設盤，必要時以編號輔助；PlayerPanel 可捲動。

**體驗：** `useSound`（擲骰/答對/答錯/買地）、答對 `canvas-confetti`、`motion` 動畫。

**RWD：** 橫向大螢幕為主；窄螢幕棋盤縮放、玩家面板改可收合抽屜（沿用 `use-mobile`）。

## 7. 測試策略（Vitest）

新增 `"test": "vitest"`、`"test:coverage": "vitest --coverage"`。集中測純函式，目標 80%+。

- `excel.ts`：合法檔產生各題型；缺欄位/錯題型/選擇答案不存在/是非非法 → 逐列錯誤；邊界（空檔、只有表頭、多餘欄位）。
- `rules.ts`（最高覆蓋）：擲骰移動與環狀、繞過起點發薪；買地（答對且錢夠）、蓋房（答對＋錢夠＋未滿）；收過路費依房子數與地主收款、付不出 → 破產與釋地；卡片各 effect 與**連鎖落點 + 保險上限**；四種結束條件與排名（含同分比資產）；skipTurns 與跳過破產玩家輪轉；**不可變性**（回傳新物件）。
- `store.ts`：persist 寫入/還原 round-trip。
- **不寫**：靜態棋盤/卡片資料；UI 以手動驗證為主，E2E 非本期範圍。

## 8. 範圍界線（YAGNI）

- 不做多裝置連線/後端。
- 不做自訂棋盤（棋盤固定內建）。
- 不做自訂機會/命運卡（內建固定一組）。
- 不做答錯懲罰（答錯僅不能買，無扣錢）。
- 不做 E2E 測試。
