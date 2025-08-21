export interface Page {
  path: string;
  imageSrc: string;
  blurDataURL: string;
  title: string;
  description: string;
  guide?: string;
}

export interface PageWithKey extends Page {
  key: keyof typeof pages;
}

export const appInfo ={
  path: "/",
  imageSrc: "/icons/favicon.webp",
  title: "TeachBox100 | 台灣互動式教學平台",
  description: "專為台灣學童設計的互動式學習平台，提供時鐘辨識、金錢計算與實用生活技能遊戲，讓孩子在趣味中學習實用知識，適合學齡前至國小學生或特教生使用。",
}

export const pages: { [key: string]: Page } = {
  "coin-introduction": {
    path: "/coin/introduction",
    imageSrc: "/images/cover_coin_introduction.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAK0lEQVQIW2M8s2n6f0ZmNgamo5kM7M7zGRjPbZnx//MHZgY+ASaGfwy/GQDZLwxSeEEb5AAAAABJRU5ErkJggg==",
    title: "認識新臺幣",
    description: "認識台灣新臺幣的各種面額、外觀特徵與相等值的硬幣、鈔票。",
    guide: "點擊任一硬幣或鈔票，了解特色與相等值的金錢。",
  },
  "coin-equivalent": {
    path: "/coin/equivalent",
    imageSrc: "/images/cover_coin_equivalent.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAK0lEQVQIW2O8k2rzXzAhm4FDSJTheV89A+Pv11f+P6pOZfj/n4VBIDyCAQDs0Q26LT5ryAAAAABJRU5ErkJggg==",
    title: "金錢等值換算",
    description: "練習硬幣、鈔票的等值換算。",
  },
  "coin-value": {
    path: "/coin/value",
    imageSrc: "/images/cover_coin_value.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACBAMAAACNhmBQAAAAGFBMVEXkWzHhWy/bfVPfeU3jd03djGHhmm/ppnJS83WVAAAADklEQVQI12NgMmMoCQQAAiEA/oMLiwwAAAAASUVORK5CYII=",
    title: "計算金錢價值",
    description: "練習計算硬幣、鈔票相加後的總價值。",
  },
  "coin-pay": {
    path: "/coin/pay",
    imageSrc: "/images/cover_coin_pay.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACBAMAAACNhmBQAAAAGFBMVEWKUj2vfVnLo3vVr33MoXXRrIHOr43PqoDH/NHxAAAADklEQVQI12MocmMIEAYABAsBHHBsQLkAAAAASUVORK5CYII=",
    title: "付款",
    description: "模擬商店付款情境，練習如何挑選正確的硬幣進行付款。",
  },
  "coin-buy": {
    path: "/coin/buy",
    imageSrc: "/images/cover_coin_buy.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAADCAYAAABbNsX4AAAASklEQVQIWwE/AMD/AeRfIf8E+f0A/v/9AAIHBAADCgEAAfPahf/0lbMAAermAAxtSQD75TUAAetoLP//CAMAYbT1AJ9HCQD78/cAXMMbETcd3KEAAAAASUVORK5CYII=",
    title: "購物",
    description: "模擬商店購物情境，練習如何挑選商品、計算總金額、以及付款的能力。",
  },
  "coin-change": {
    path: "/coin/change",
    imageSrc: "/images/cover_coin_change.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAK0lEQVQIW2N8Gar0n5GFlYEznpvhvWQ5A+Oj88v/c3bUMvz9x8DAxMjAAAC/nQrBs+CLpQAAAABJRU5ErkJggg==",
    title: "找零",
    description: "模擬商店找零情境，練習計算出正確應該找零的金額。",
  },
  "clock-current-time": {
    path: "/clock/current-time",
    imageSrc: "/images/cover_current_time.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAALUlEQVQIWwEiAN3/AcZZM/8OJgoA+eD1APn6/AAB5NvE/+R+bQAHCgYAXcj0ABtUD9CQT3miAAAAAElFTkSuQmCC",
    title: "學習讀時鐘",
    description: "練習辨認時針、分針，並且判讀出正確時間。",
    guide: "拖動時針或是下方滑桿來調整時間。"
  },
};
