# 圈叉搶答（/quiz/morris）

## MORR-001 設定後兩隊準備與倒數
- smoke: true
- viewport: desktop, mobile
- auto: e2e/morris.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /quiz/morris → 開始使用 → 下一步 → 開始比賽
  2. 只按紅隊「準備好了」，再按藍隊「準備好了」
- 預期: 一隊準備時仍顯示 READY?；兩隊準備後倒數 3、2、1 才同時出題；紅圈與藍叉分處棋盤兩側，中央棋盤為正方形
- issues: —

## MORR-002 答錯冷卻、答對鎖場與放棋搬棋
- smoke: false
- viewport: desktop, mobile
- auto: e2e/morris.spec.ts, lib/morris/game.test.ts
- 前置: MORR-001 開局；使用六題答案已知的題庫
- 步驟:
  1. 紅隊答錯，立刻讓藍隊答對
  2. 藍隊選空格放棋，連放三枚後再次答對，先點自己的棋、再點任一空格
- 預期: 紅隊只冷卻 3 秒且藍隊仍可答；藍隊答對後全場暫停、紅隊答案鈕鎖住；藍隊一次只獲一個棋步；三枚入場後可移動任一自己的棋到任一空格，不必等另一隊放滿
- issues: —

## MORR-003 三連線獲勝與手動和局
- smoke: false
- viewport: desktop, mobile
- auto: e2e/morris.spec.ts, lib/morris/game.test.ts
- 前置: MORR-001 開局；使用六題答案已知的題庫
- 步驟:
  1. 同隊答對並放棋成橫、直或斜三連線
  2. 按「再玩一次」，再按頂列「結束本局」並確認
- 預期: 三連線時畫出勝線與獲勝隊的大圈或大叉，顯示「隊名 獲勝！」；再玩一次清空；手動結束顯示「和局」中性卡與設定入口
- issues: —

## MORR-004 題庫限制與兩隊題目
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 題型、題數和兩隊抽題規則由 `lib/morris/game.test.ts` 保護；設定擋開始與左右題目畫面尚無 e2e
- 前置: 清掉 localStorage；備有五題及六題的選擇／是非題庫、含簡答的題庫
- 步驟:
  1. 匯入五題，查看開始鈕；再匯入六題並開始
  2. 查看兩隊第一題，依序答題並觀察題目更換
- 預期: 少於六題不能開始，簡答題略過並提示；難度只篩題、不增加棋步；兩隊當下題目不同，遇到相同題時一側等待對方換題
- issues: —

## MORR-005 分享設定
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 編解碼由 `lib/share/units.test.ts`、`lib/morris/share.test.ts` 保護；新分頁套用的瀏覽器流程尚無 e2e
- 前置: 清掉 localStorage；可複製完整連結
- 步驟:
  1. 設定兩隊名稱、難度與題庫，在最後一站按「分享設定」並複製完整連結
  2. 用新分頁開連結
- 預期: 自動打開設定並帶入隊名、難度、題庫；顯示「已載入分享連結」，網址 hash 被清掉，重整不重複套用
- issues: —

## MORR-006 投影觸控與勝利回饋
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 需大型觸控螢幕、投影後排與實際喇叭檢查近同時作答、放／移棋手感、音效及動態
- 前置: MORR-001 開局，音效開啟
- 步驟:
  1. 進全螢幕，兩隊接近同時作答，輪流放棋與移棋
  2. 從後排查看題目、棋盤與選項，打到三連線
- 預期: 左右題目及中央棋盤後排可讀；最先被接受的答對鎖住全場；倒數、答對、答錯、落棋與勝利音效正常；獲勝圈叉逐筆畫出，隊色紙屑從獲勝側鋪滿螢幕
- issues: —
