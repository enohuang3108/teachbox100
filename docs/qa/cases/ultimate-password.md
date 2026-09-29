# 終極密碼（/ultimate-password）

## PASS-001 兩站設定後開始
- smoke: true
- viewport: desktop, mobile
- auto: e2e/game-template.spec.ts
- 前置: 清掉 localStorage、sessionStorage
- 步驟:
  1. 開 /ultimate-password → 開始使用，查看題庫站
  2. 選自訂題庫但不匯入，按「下一步」；再切回內建題庫並選難度，按「開始遊戲」
- 預期: 自訂題庫尚未匯入時「開始遊戲」不可用；選有效題庫後出現第一題、答案鈕和「目前密碼範圍：1 到 100」
- issues: —

## PASS-002 答題回饋與猜錯範圍
- smoke: false
- viewport: desktop, mobile
- auto: e2e/game-template.spec.ts, lib/ultimate-password/game.test.ts
- 前置: PASS-001 開局；使用答案已知的題庫，並在測試環境固定密碼
- 步驟:
  1. 答錯一道題，觀察結果和正解；下一題答對
  2. 用數字滑桿及加減鈕選錯密碼，按「確認密碼」
- 預期: 答錯／答對都先顯示結果與正解，答錯後回到可作答狀態；答對後才可猜密碼；猜錯先提示新範圍，再回到可作答狀態，該局密碼不變
- issues: —

## PASS-003 猜中與再玩一局
- smoke: false
- viewport: desktop, mobile
- auto: e2e/game-template.spec.ts, lib/ultimate-password/game.test.ts
- 前置: PASS-001 開局；在測試環境固定密碼並開啟音效
- 步驟:
  1. 題目答對後，選正確密碼並確認
  2. 按「再玩一局」
- 預期: 揭曉正確數字與「破解成功！」；再玩一局重設為 1 到 100 並回到作答
- issues: —

## PASS-004 設定與進行中局面的重整保存
- smoke: false
- viewport: desktop, mobile
- auto: e2e/game-template.spec.ts
- 前置: 清掉 localStorage、sessionStorage；使用答案已知的題庫，並在測試環境固定密碼
- 步驟:
  1. 設定題庫與難度，開始後答對、猜錯一次，記下範圍與答題階段
  2. 重整頁面
- 預期: 重整後跳過介紹，密碼、範圍及當下答題階段接著玩，設定的難度仍在
- issues: —

## PASS-005 分享設定與失效連結
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 來回編碼與壞連結由 `lib/share/units.test.ts` 保護；新分頁帶入及短連結到期提示的瀏覽器流程尚無 e2e
- 前置: 清掉 localStorage；可複製完整連結
- 步驟:
  1. 設定題庫與難度，在最後一站按「分享設定」，開完整連結於新分頁
  2. 對可用短連結重做，查看到期日；再試壞掉的 hash
- 預期: 自訂題庫未匯入時「分享設定」不可用；有效連結自動打開設定並帶入題庫與難度，短連結顯示到期日，網址 hash 被清掉；壞連結不套用設定
- issues: —

## PASS-006 全螢幕與減少動態效果
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 後排可讀性、動畫節奏、聲音和作業系統減少動態設定需真機觀察
- 前置: PASS-001 開局
- 步驟:
  1. 進全螢幕，在教室後排看題目、範圍、答題切換與破關；聽音效
  2. 開啟系統「減少動態效果」再走一次答錯與破解
- 預期: 文字與結果後排可讀；作答鈕按下後不變色，結果只在中央斜貼的紙膠帶呈現，答錯不搖；鎖搖晃後炸開，滴答、開鎖聲及紙屑正常；減少動態時仍清楚辨識結果與正解
- issues: —

## PASS-007 關閉分頁後清空進行中局面
- smoke: false
- viewport: desktop, mobile
- auto: e2e/game-template.spec.ts
- 前置: PASS-001 開局；答對題目並猜錯一次，記下縮小的範圍
- 步驟:
  1. 關閉此分頁
  2. 從瀏覽器新開一個獨立分頁進 /ultimate-password，重新打開設定
- 預期: 進行中密碼與範圍已清空，重新開始時範圍為 1 到 100；題庫與難度設定仍在
- issues: —

## PASS-008 換題時不會洩漏固定密碼
- smoke: false
- viewport: desktop, mobile
- auto: manual —— `e2e/game-template.spec.ts` 使用單題預設題庫，只驗回到可作答狀態；兩題之間確實切換尚無瀏覽器斷言
- 前置: 匯入兩題以上、題目與正解不同的題庫；在測試環境固定密碼
- 步驟:
  1. 答錯一題，記下下一題文字
  2. 答對後猜錯密碼，記下再下一題文字與範圍
  3. 答對新題並猜中原本固定密碼
- 預期: 答錯題目與猜錯密碼後都換到另一題，期間固定密碼未變，範圍沿用前次提示；只有猜中時才揭曉密碼
- issues: —
