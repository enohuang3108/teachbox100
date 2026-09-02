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

export const appInfo = {
  path: "/",
  // 白底圓角磚版本：同時供 favicon、OG 圖與 JSON-LD logo 使用。
  // 必須是 webp —— app/opengraph-image.tsx 把 Content-Type 寫死了。
  imageSrc: "/icons/logo-tile.webp",
  title: "TeachBox100 | 台灣互動式教學平台",
  description:
    "專為台灣學童設計的互動式學習平台，提供時鐘辨識、金錢計算與實用生活技能遊戲，讓孩子在趣味中學習實用知識，適合學齡前至國小學生或特教生使用。",
};

export const pages: { [key: string]: Page } = {
  "coin-introduction": {
    path: "/coin/introduction",
    imageSrc: "/images/covers/coin-introduction-v2.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afry5v/++gEBAwAEC//otf304Qkmafz7+gL//voB6LAAAwn/+OkB6bIJAtvk17j9AQcEBgYK9hhdCPjf9/sAydkL7+bOoMLea2sGAeXgz9Tj6jEQ4g8SHvYLN0hGRgECArGtowLZ496+xayTv9v4+BoQDwI3NTAGBAEICAgB/vXq+/z78PPvEQoOAQgH2tnc+fn5LzEvbK1MgAx6lX0AAAAASUVORK5CYII=",
    title: "認識新臺幣",
    description: "認識台灣新臺幣的各種面額、外觀特徵與相等值的硬幣、鈔票。",
    guide: "點擊任一硬幣或鈔票，了解特色與相等值的金錢。",
  },
  "coin-equivalent": {
    path: "/coin/equivalent",
    imageSrc: "/images/covers/coin-equivalent.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afvz5v8A/wQICMnHywMDAisrKAYFBf/+/gIAAQH6+vv/AAKvsbaHi5P9/wAAAP///wACAgQE8fP1uLe92dvb/v37x8rU5ujwBAYFAv3+Bv/twS8X3wQFDOrt9hgAyRUBz/z9BgIBAf3e6gnh8xYMCgQREQ/u8fbJys7/AAAE//z3PURRAAQF0dbpAAD/N0lk/Pv7A//1HVJMKd1FXYIAAAAASUVORK5CYII=",
    title: "金錢等值換算",
    description: "練習硬幣、鈔票的等值換算。",
  },
  "coin-value": {
    path: "/coin/value",
    imageSrc: "/images/covers/coin-value.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Af726gAAAAABAfDv8AkJCQQEBAMEAwD//wIAAAD9/f0BBwqlqq9gZm7i4+MBBAb+/v4E////BAUEAPv2tre53+PpFBcZAP79AQEBAv8A//j9Aoyevujt9PDo19bPw/4CAv7+/wQDCgy/uLz69u8xLSgYDffHyMgABA84PD0B/vrt7+vtEhAL1tnf7e/0JCMhCQgEDxEQOfRHae+m0N4AAAAASUVORK5CYII=",
    title: "計算金錢價值",
    description: "練習計算硬幣、鈔票相加後的總價值。",
  },
  "coin-pay": {
    path: "/coin/pay",
    imageSrc: "/images/covers/coin-pay.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Af3y5QIFBQAIB//19v7+/v///wICAgAAAAIBBgfg4OKHgova3N4DCAkEAwjj7vsBAQACAQEACggIk5me3N3hAAQCgqeP7/PfAQYJBAAEBbC1uPX19svJxczXv4OspxoGEzApMwQA//8uKyk+OzdQUVELDAxhUWgEBgT+9/QB/fTn//7+9PT1Dw8PAAgHAP39AP///vn64LdDPhyNjO4AAAAASUVORK5CYII=",
    title: "付款",
    description: "模擬商店付款情境，練習如何挑選正確的硬幣進行付款。",
  },
  "coin-buy": {
    path: "/coin/buy",
    imageSrc: "/images/covers/coin-buy.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afzv4wMGBQADBAD7+wD//wAHBgD8/f37+wQBCAjY19mfp602IR0VBQMDJSYTDAsmJyUA//To7eLXFRUVgn14///19evi8+jd/PDkAgAHB8vO0Pf39iYmJquFe3iHke30/gMFAgIA/v4YFhYxLy4wKyaszd3VzskD/PIAAQMB/PDkAAAA7e7vDAwLCgwMAAAA/fr6AAAAKC5DHUTkuowAAAAASUVORK5CYII=",
    title: "購物",
    description:
      "模擬商店購物情境，練習如何挑選商品、計算總金額、以及付款的能力。",
  },
  "coin-change": {
    path: "/coin/change",
    imageSrc: "/images/covers/coin-change.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afry4////wUFA/3/CP3wyQEB/gANNwH+9gL+/v8BBATm5+r49u8G/twBBBEDAf4AAAECBwsL1NLTZWx5rayn8/P0+gUh9fj2AAEBAufq7wwZIw8MCJujsNrqHOnx9bzT6wMGAwQAAAH3+frl5eVZVlY0P1337+AfNBr9+v0B/PPjAwwKtK+3HBoYLC8r/fn6AQECAQEAkqhI3D5W4b8AAAAASUVORK5CYII=",
    title: "找零",
    description: "模擬商店找零情境，練習計算出正確應該找零的金額。",
  },
  "clock-current-time": {
    path: "/clock/current-time",
    imageSrc: "/images/covers/clock-current-time.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afzt3fz08wcZHebl5MPEyOvr7CoqJ0FAPQH769r+8vH3DxW7ubr6+/o9OjXf3+L9AAICBBESqMPMZGZu3d/hJyQh2tzfJyYi3NzeAv39AdnV2MPGyxUUEjM7NSgmIwICAgEBAQLKxsawtbqPiX4aGBfTy9AFBQPNz9MpKCYB29PFDAwLCgoJ+/3+ubm98/T1LCsoOzs4ADhLCbN8cRcAAAAASUVORK5CYII=",
    title: "學習讀時鐘",
    description: "練習辨認時針、分針，並且判讀出正確時間。",
    guide: "拖動時針或是下方滑桿來調整時間。",
  },
  monopoly: {
    path: "/monopoly",
    imageSrc: "/images/covers/monopoly.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afvy4wD//wQIBwAEBPbt6QQFCQMEBf///gQBAQH7/v6rp60UFBMuKSETFgz///8AAAAB+vHiAgUEREhTFBQVoJ+XBwH9//8AAQEAAv/+/QMJEiUwNwIJBwsOCQQEBgMCAgD/AAIBBAz+4J54Es4u+Qt5oMqqt6Pv8/ADBAQEAQD//gAKHyw2RBglwgwKDw0T/v7+/wAAMTk1XGL75+0AAAAASUVORK5CYII=",
    title: "大富翁",
    description: "匯入自訂題庫，答對才能買地蓋房，最多 20 人同樂的教學大富翁。",
    guide: "老師先匯入 Excel 題庫並設定規則，再開始遊戲。",
  },
};
