# 九九乘法練習（/multiplication）

## MULT-001 選範圍開始，出第一題
- smoke: True
- viewport: desktop, mobile
- auto: e2e/setup-and-start.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /multiplication → 開始使用 → 下一步 → 開始練習
- 預期: 第 1 / 20 題・答對 0，四個答案
- issues: —

## MULT-002 作答紀錄
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 新功能（154a7e9），待寫 e2e
- 前置: MULT-001
- 步驟:
  1. 答對一題、答錯一題
  2. 完成全部題數
- 預期: 答錯停留較久並標出正解；結算列出作答紀錄與錯題；分數從 0 跳到答對題數並顯示對應鼓勵貼紙，答對八成以上有紙屑，全對還有兩側紙屑砲
- issues: —

## MULT-003 分享練習設定
- smoke: false
- viewport: desktop, mobile
- auto: e2e/shared-setup.spec.ts, lib/share/units.test.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 改變乘法練習範圍，複製完整分享連結
  2. 用新分頁開連結
- 預期: 設定自動打開並帶入相同練習範圍；顯示載入提示，網址 hash 被清掉
- issues: —

## MULT-004 手機作答紀錄不遮住答案與結算
- smoke: false
- viewport: mobile
- auto: e2e/multiplication-finish.spec.ts
- 前置: 清掉 localStorage，選 10 題開始
- 步驟:
  1. 手機寬度連續回答全部題目，確認每題選項都能點
  2. 結算時查看分數、鼓勵文字與作答紀錄
- 預期: 作答紀錄不擋選項，不遮住結算分數；10 筆作答和錯題都可讀
- issues: —
