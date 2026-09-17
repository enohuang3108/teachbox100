# 噪音計（/noise）

## NOISE-001 拒絕麥克風時給提示
- smoke: True
- viewport: desktop, mobile
- auto: e2e/instant-tools.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /noise
  2. 按「噓」並拒絕麥克風
- 預期: 出現「瀏覽器擋住了麥克風」提示
- issues: —

## NOISE-002 真實麥克風音量反應與釋放
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 真實麥克風，agent 無法操作
- 前置: 清掉 localStorage
- 步驟:
  1. 按噓並允許
  2. 說話、安靜
  3. 離開頁面
- 預期: 刻度隨音量變化；離開後瀏覽器麥克風指示燈熄滅
- issues: —

## NOISE-003 權限詢問中離開頁面，麥克風會釋放
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 真實麥克風
- 前置: 清網站權限
- 步驟:
  1. 按噓，權限詢問出現時離開頁面
  2. 之後允許權限
- 預期: 瀏覽器麥克風指示燈不亮
- issues: —
