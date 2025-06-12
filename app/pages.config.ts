export interface Page {
  path: string;
  imageSrc: string;
  blurDataURL: string;
  title: string;
  description: string;
}

export interface PageWithKey extends Page {
  key: keyof typeof pages;
}

export const appInfo ={
  path: "/",
  imageSrc: "/icons/favicon.webp",
  title: "TeachBox100 | 台灣互動式教育平台",
  description: "專為台灣學童設計的互動式學習平台，提供時鐘辨識、金錢計算與實用生活技能遊戲，讓孩子在趣味中學習實用知識，適合學齡前至國小學生或特教生使用。",
}

export const pages: { [key: string]: Page } = {
  "coin-introduction": {
    path: "/coin/introduction",
    imageSrc: "/images/cover_coin_introduction.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAK0lEQVQIW2M8s2n6f0ZmNgamo5kM7M7zGRjPbZnx//MHZgY+ASaGfwy/GQDZLwxSeEEb5AAAAABJRU5ErkJggg==",
    title: "認識新臺幣",
    description: "認識台灣新臺幣的各種面額、外觀特徵與等值換算。",
  },
  "coin-equivalent": {
    path: "/coin/equivalent",
    imageSrc: "/images/cover_coin_equivalent.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAK0lEQVQIW2O8k2rzXzAhm4FDSJTheV89A+Pv11f+P6pOZfj/n4VBIDyCAQDs0Q26LT5ryAAAAABJRU5ErkJggg==",
    title: "金錢等值換算",
    description: "學習不同幣值的等值換算，培養生活中的金錢運用能力。",
  },
  "coin-value": {
    path: "/coin/value",
    imageSrc: "/images/cover_coin_value.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACBAMAAACNhmBQAAAAGFBMVEXkWzHhWy/bfVPfeU3jd03djGHhmm/ppnJS83WVAAAADklEQVQI12NgMmMoCQQAAiEA/oMLiwwAAAAASUVORK5CYII=",
    title: "計算金錢價值",
    description: "學習計算不同幣值總和，提供多種答題模式與難度設定。",
  },
  "coin-pay": {
    path: "/coin/pay",
    imageSrc: "/images/cover_coin_pay.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACBAMAAACNhmBQAAAAGFBMVEWKUj2vfVnLo3vVr33MoXXRrIHOr43PqoDH/NHxAAAADklEQVQI12MocmMIEAYABAsBHHBsQLkAAAAASUVORK5CYII=",
    title: "學習付款",
    description: "模擬商店付款情境，學習如何使用硬幣正確付款，培養生活中的金錢使用能力。",
  },
  "coin-change": {
    path: "/coin/change",
    imageSrc: "/images/cover_coin_change.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAK0lEQVQIW2N8Gar0n5GFlYEznpvhvWQ5A+Oj88v/c3bUMvz9x8DAxMjAAAC/nQrBs+CLpQAAAABJRU5ErkJggg==",
    title: "學習找零",
    description: "模擬商店找零情境，培養正確計算與找零能力，學習基礎數學與金錢運用。",
  },
  "clock-current-time": {
    path: "/clock/current-time",
    imageSrc: "/images/cover_current_time.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAALUlEQVQIWwEiAN3/AcZZM/8OJgoA+eD1APn6/AAB5NvE/+R+bQAHCgYAXcj0ABtUD9CQT3miAAAAAElFTkSuQmCC",
    title: "學習讀時鐘",
    description: "學習看時鐘與辨認時針、分針，練習正確判讀時間。",
  },
};
