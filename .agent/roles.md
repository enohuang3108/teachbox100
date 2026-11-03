# 分工：teachbox100 的實際值

通用的分工、「輪到誰」、叫醒管理者、重建清單見 `~/agent-kit/brigade/roles.md`。這份只寫誰扮演哪個角色、在哪裡。
管理者守則見 [manager.md](manager.md)。

**GitHub 迴圈還沒接上**（`brigade-5-loop` 未完成）：沒有 `.github/workflows/agent-loop.yml`、runner、`agent` 標籤。
在那之前，管理者開的 Issue 沒有人接；派工改成老大在本機 `queue.md`＋`bin/brigade-run`。

## 誰

| 角色 | teachbox100 裡是 | GitHub 帳號 |
|---|---|---|
| 老大 | 使用者 | enohuang3108 |
| 管理者 | Grok Bot（MacBook 桌面 App）上的 bot「TeachBox100 主管」 | unclehuang-bot（write） |
| 執行者 | 未設定（`brigade-5-loop` 決定在哪台機器） | Executor App `brigade-commis[bot]` |
| 驗收者 | 未設定 | Reviewer App `brigade-taster[bot]` |
| 審查者 | `~/agent-kit/brigade/models` 的 `REVIEWER`（grok） | — |

## 放手的門檻

automerge 還沒開。條件同 weather：累計 **20 張** `accepted`、期間老大對 accepted 的 PR 零 revert；只放 two-way door 的 diff。

## 指令

```sh
~/agent-kit/brigade/bin/brigade-inbox enohuang3108/teachbox100 enohuang3108 unclehuang-bot 'brigade-commis[bot]'
```

## 重建時的實際值

- **GitHub**（enohuang3108/teachbox100，**public**）：secrets `GROK_WEBHOOK_URL`、`GROK_WEBHOOK_KEY`（跟 weather 同一個 Routine 時共用值，分開時填這個 Routine 的）。
  public repo 掛 self-hosted runner：workflow 只接受 enohuang3108 與 unclehuang-bot 觸發，fork 的 PR 不跑
- **Grok Bot**：Routine 觸發選「When a webhook fires」，指示照 `~/agent-kit/brigade/roles.md` 的範本，
  `<repo>` 填 enohuang3108/teachbox100，`<專案>` 填 `~/side_project/teachbox100`
