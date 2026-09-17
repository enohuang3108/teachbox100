# qa-run 格式

## Case 檔 `docs/qa/cases/<unit>.md`

```md
# <單元名>（/path）

## <UNIT>-001 設定後可開始
- smoke: true
- viewport: desktop, mobile
- auto: e2e/setup-and-start.spec.ts   # 或 manual —— 為什麼不自動化
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /path
  2. 按「開始設定」
  3. 按「開始」
- 預期: 進入遊戲畫面，無 console error
- issues: —
```

ID 用單元代號加流水號，刪 case 時不重用號碼。

## 報告 `docs/qa/reports/YYYY-MM-DD-<short-sha>.md`

```md
---
commit: <full sha>
base: <base sha>
target: http://127.0.0.1:3100 | https://teachbox100.com
verdict: 可上線 | 有條件上線 | 不可上線
---

# QA 報告 YYYY-MM-DD

## 範圍
| 單元 | 原因 |

## 自動閘門
| 步驟 | 結果 | 最後一行輸出 |

## 手動結果
| case | desktop | mobile | 截圖 | 備註 |

## Fail
每條：case ID、實際 vs 預期、重現步驟、截圖、prod 是否重現、issue 連結

## 需要人補測
每條：case ID、要做什麼（例：兩支手機加入計分板房間）
```

## GitHub issue

- 標題：`[<單元>] <使用者看到的症狀>`
- label：`bug`
- 內文：

```md
**網址**：https://teachbox100.com/path
**裝置**：desktop 1440×900 / mobile 390×844，Chromium
**case**：docs/qa/cases/<unit>.md#<ID>

## 重現步驟
1.

## 預期

## 實際

## 證據
截圖、console error 原文

發現於 QA 報告 docs/qa/reports/<file>.md
```
