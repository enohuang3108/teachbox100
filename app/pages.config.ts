export interface Page {
  path: string;
  imageSrc: string;
  blurDataURL: string;
  title: string;
  description: string;
  guide?: string;
}

export interface PageWithKey extends Page {
  key: PageKey;
}

export const appInfo = {
  path: "/",
  // 白底圓角磚版本：同時供 favicon、OG 圖與 JSON-LD logo 使用。
  // 必須是 webp —— app/opengraph-image.tsx 把 Content-Type 寫死了。
  imageSrc: "/icons/logo-tile.webp",
  title: "TeachBox100 | 台灣互動式教學平台",
  description:
    "給台灣學童的免費互動教材：認識新臺幣、看懂時鐘、算找零，還有老師上課用得到的小遊戲。學齡前到國小、特教班都適合。",
};

const pagesConfig = {
  "coin-introduction": {
    path: "/coin/introduction",
    imageSrc: "/images/covers/warm/coin-introduction-v2.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afry5v/++gEBAwAEC//otf304Qkmafz7+gL//voB6LAAAwn/+OkB6bIJAtvk17j9AQcEBgYK9hhdCPjf9/sAydkL7+bOoMLea2sGAeXgz9Tj6jEQ4g8SHvYLN0hGRgECArGtowLZ496+xayTv9v4+BoQDwI3NTAGBAEICAgB/vXq+/z78PPvEQoOAQgH2tnc+fn5LzEvbK1MgAx6lX0AAAAASUVORK5CYII=",
    title: "認識新臺幣",
    description: "認識新臺幣每一種硬幣和鈔票長什麼樣子，還有哪些組合價值一樣。",
    guide: "點一下硬幣或鈔票，看它的特色和可以換成哪些錢。",
  },
  "coin-equivalent": {
    path: "/coin/equivalent",
    imageSrc: "/images/covers/warm/coin-equivalent.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afvz5v8A/wQICMnHywMDAisrKAYFBf/+/gIAAQH6+vv/AAKvsbaHi5P9/wAAAP///wACAgQE8fP1uLe92dvb/v37x8rU5ujwBAYFAv3+Bv/twS8X3wQFDOrt9hgAyRUBz/z9BgIBAf3e6gnh8xYMCgQREQ/u8fbJys7/AAAE//z3PURRAAQF0dbpAAD/N0lk/Pv7A//1HVJMKd1FXYIAAAAASUVORK5CYII=",
    title: "金錢等值換算",
    description: "練習用不同的硬幣、鈔票湊出一樣的金額。",
  },
  "coin-value": {
    path: "/coin/value",
    imageSrc: "/images/covers/warm/coin-value.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Af726gAAAAABAfDv8AkJCQQEBAMEAwD//wIAAAD9/f0BBwqlqq9gZm7i4+MBBAb+/v4E////BAUEAPv2tre53+PpFBcZAP79AQEBAv8A//j9Aoyevujt9PDo19bPw/4CAv7+/wQDCgy/uLz69u8xLSgYDffHyMgABA84PD0B/vrt7+vtEhAL1tnf7e/0JCMhCQgEDxEQOfRHae+m0N4AAAAASUVORK5CYII=",
    title: "計算金錢價值",
    description: "把一堆硬幣、鈔票加起來，算出總共多少元。",
  },
  "coin-pay": {
    path: "/coin/pay",
    imageSrc: "/images/covers/warm/coin-pay.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Af3y5QIFBQAIB//19v7+/v///wICAgAAAAIBBgfg4OKHgova3N4DCAkEAwjj7vsBAQACAQEACggIk5me3N3hAAQCgqeP7/PfAQYJBAAEBbC1uPX19svJxczXv4OspxoGEzApMwQA//8uKyk+OzdQUVELDAxhUWgEBgT+9/QB/fTn//7+9PT1Dw8PAAgHAP39AP///vn64LdDPhyNjO4AAAAASUVORK5CYII=",
    title: "付款",
    description: "看商品價格，從錢包裡挑出剛好的錢付款。",
  },
  "coin-buy": {
    path: "/coin/buy",
    imageSrc: "/images/covers/warm/coin-buy.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afzv4wMGBQADBAD7+wD//wAHBgD8/f37+wQBCAjY19mfp602IR0VBQMDJSYTDAsmJyUA//To7eLXFRUVgn14///19evi8+jd/PDkAgAHB8vO0Pf39iYmJquFe3iHke30/gMFAgIA/v4YFhYxLy4wKyaszd3VzskD/PIAAQMB/PDkAAAA7e7vDAwLCgwMAAAA/fr6AAAAKC5DHUTkuowAAAAASUVORK5CYII=",
    title: "購物",
    description: "自己挑商品、算總價、再付款，把買東西的流程走一遍。",
  },
  "coin-change": {
    path: "/coin/change",
    imageSrc: "/images/covers/warm/coin-change.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afry4////wUFA/3/CP3wyQEB/gANNwH+9gL+/v8BBATm5+r49u8G/twBBBEDAf4AAAECBwsL1NLTZWx5rayn8/P0+gUh9fj2AAEBAufq7wwZIw8MCJujsNrqHOnx9bzT6wMGAwQAAAH3+frl5eVZVlY0P1337+AfNBr9+v0B/PPjAwwKtK+3HBoYLC8r/fn6AQECAQEAkqhI3D5W4b8AAAAASUVORK5CYII=",
    title: "找零",
    description: "客人付了錢，算出該找多少，再把零錢湊出來。",
  },
  "clock-current-time": {
    path: "/clock/current-time",
    imageSrc: "/images/covers/warm/clock-current-time.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afzt3fz08wcZHebl5MPEyOvr7CoqJ0FAPQH769r+8vH3DxW7ubr6+/o9OjXf3+L9AAICBBESqMPMZGZu3d/hJyQh2tzfJyYi3NzeAv39AdnV2MPGyxUUEjM7NSgmIwICAgEBAQLKxsawtbqPiX4aGBfTy9AFBQPNz9MpKCYB29PFDAwLCgoJ+/3+ubm98/T1LCsoOzs4ADhLCbN8cRcAAAAASUVORK5CYII=",
    title: "學習讀時鐘",
    description: "分清楚時針和分針，讀出現在幾點幾分。",
    guide: "拖動指針或下方的滑桿來調整時間。",
  },
  memory: {
    path: "/memory",
    imageSrc: "/images/covers/warm/memory.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afny57K4wvr6+U5NTf//ALO0swcHB05IPgT8/Pyor7nz+whGIuf/AAGfrt4PB/lKRDsEBgYFDAsJAfn+Ahg8/v79Eg/pDQoNBQQDBP39/hISEQj39nyTtwIECZh8TwEDB/v+AwT///7Z3OHy9PUDAP0DChb+6QEDBg3/FCsEAwMEXVRI/f79AgEC/f79CCxQ/f38Afvv/UdFcv1UWGwAAAAASUVORK5CYII=",
    title: "翻牌配對",
    description:
      "老師自訂 2 到 15 組配對卡，孩子翻牌找出一對，練習詞彙與對應關係。",
    guide: "老師先設定配對組再開始，孩子翻兩張牌找出一對。",
  },
  wheel: {
    path: "/draw/wheel",
    imageSrc: "/images/covers/warm/wheel-v2.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afbv4QEBAf/9/gYSEOng1/n18x8rN/nw8AH58eP9/PwGEBDpo7QC53cFDPP07XAYdW0E8vT1iY2XNjUlQt+L8t3n/A0KAPeD/+42Av39/LK1ut7b2Qsn8QMODf0CEA4sAAH+8wL//gAuKSNMVlzw3Wz+9vIKE+XozFEAFD4B9/Di9vb3AwQDCAoO/+zBAPz0ABNDAAMDerRNsypywywAAAAASUVORK5CYII=",
    title: "抽籤轉盤",
    description:
      "貼上名單或選項，轉一下隨機抽出一個，點名、分組、選題目都好用。",
  },
  lottery: {
    path: "/draw/lottery",
    imageSrc: "/images/covers/warm/lottery.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Affv4f7+/woJAwAFB/nmywQPJgEFDvr5+AL//gAKDAm0x+ORqMgCDRnn6e3h4uQCAwIEBwkEvs/ne5mn3t8M6Ow01rqWNjg4e3t0AgIHA77T6ggPKSoU9tHg7Pn7/PLy8/8BAQL++P5WNxXu7O3N6+1dRiJOSUULCgkA/f0B+O/jAAD8zs/S/PsALCojAQQHAwMDBwYFp+FHEotb85QAAAAASUVORK5CYII=",
    title: "抽籤機",
    description: "名單變成一顆顆乒乓球在玻璃球裡亂飛，被吹出來的那顆就是答案。",
  },
  monopoly: {
    path: "/monopoly",
    imageSrc: "/images/covers/warm/monopoly.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afvy4wD//wQIBwAEBPbt6QQFCQMEBf///gQBAQH7/v6rp60UFBMuKSETFgz///8AAAAB+vHiAgUEREhTFBQVoJ+XBwH9//8AAQEAAv/+/QMJEiUwNwIJBwsOCQQEBgMCAgD/AAIBBAz+4J54Es4u+Qt5oMqqt6Pv8/ADBAQEAQD//gAKHyw2RBglwgwKDw0T/v7+/wAAMTk1XGL75+0AAAAASUVORK5CYII=",
    title: "大富翁",
    description: "匯入自訂題庫，答對才能買地蓋房，最多 20 人同樂的教學大富翁。",
    guide: "老師先匯入 Excel 題庫並設定規則，再開始遊戲。",
  },
  timer: {
    path: "/timer",
    imageSrc: "/images/covers/warm/timer.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR42gGWAGn/Afbv5AkKBtPR1R0iLAkF/AcGBAABAvj4+AIICAS1y+iErMn94pkGBQPAxMnP0dMCAgIC0d/vw9rqlGNOBuro89qXg42drbCyBgoMAuPq9SIYDhUM9OgUXKfUGA0G+sPHzfXz8gRALxmEq9OS+xHX4u5oS1D+7e/Jz9X9/PwB+/Pn+fv9t8vkKR8QKx8P4uTrBgUEEhIRt8VNQdl18S8AAAAASUVORK5CYII=",
    title: "計時器",
    description:
      "上課用的大字倒數計時器，時間到會響鈴，分組討論、小考、限時作答都好用。",
  },
  noise: {
    path: "/noise",
    imageSrc: "/images/covers/warm/noise.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR42gGWAGn/Affw5QAAAP/+/gIFBvf29v/+/REWFffy8wIAAAD+/v8ABggFAP3k4t1udHyoqK0EBQUCAQAAChAP9MS77JuW/AH+tri8/Pr6BQsNAvr8AM/VvPG2f/fl7h0kLAUEA8jKzvLv7gLc5N6quq4EExkIFxbr6ekNDA3v8PD+/f0B8+3i/P37B//9//8DBAsL5ubnEhIRCgsLzVxOYMzmoBUAAAAASUVORK5CYII=",
    title: "噪音計",
    description:
      "用麥克風即時顯示教室有多吵，太大聲就變紅色，聲音只在這台裝置上計算。",
  },
  multiplication: {
    path: "/multiplication",
    imageSrc: "/images/covers/warm/multiplication.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR42gGWAGn/Affw5QILDAD39QYGA/Pz9/Ly8xcXFvv7+wL99PPunpXpy8zM4fT29fZ2fIObn6QFBQUEAAMD+trY9g8c2AX84OTKuLq9IB8dAgcIAgEHDxx3Ze3vhNrTmjExKw8PDr7BxPTw7wL/BAQCBw3T6/bB0NAjIiJNS0hPS0gGBwcB9+/kAQID9/n3+fv5DgoO9PX0CgkJBgYGMvBI3uJSnLwAAAAASUVORK5CYII=",
    title: "九九乘法練習",
    description: "自己挑要練的乘法表和題數，四選一作答，答完馬上看到答對幾題。",
    guide: "先選要練哪幾段乘法表，再開始作答。",
  },
} satisfies Record<string, Page>;

export type PageKey = keyof typeof pagesConfig;

/** 用 string 查表的地方（jsonld、og-image、seo）走這個；要編譯期擋錯的 key 用 PageKey */
export const pages: { [key: string]: Page } = pagesConfig;

export interface Hub {
  path: string;
  title: string;
  /** 屬於這個 hub 的 pages key，陣列順序即建議的學習順序 */
  children: string[];
}

/**
 * 分類頁。刻意不放進 pages —— pages 會被首頁卡片牆與各頁的「其他教材」
 * 直接展開，hub 混進去會跟教材卡片長得一樣，語意也不對。
 */
export const hubs: Record<string, Hub> = {
  draw: {
    path: "/draw",
    title: "抽籤",
    children: ["wheel", "lottery"],
  },
  coin: {
    path: "/coin",
    title: "認識金錢",
    children: [
      "coin-introduction",
      "coin-equivalent",
      "coin-value",
      "coin-pay",
      "coin-buy",
      "coin-change",
    ],
  },
};

/** 找出某個教材頁所屬的 hub，沒有就回傳 undefined */
export function hubOf(pageKey: string): Hub | undefined {
  return Object.values(hubs).find((hub) => hub.children.includes(pageKey));
}

/** 同一個 hub 底下的所有單元（含自己），麵包屑下拉切換用。沒掛 hub 就回空陣列 */
export function siblingsOf(pageKey: string): { path: string; title: string }[] {
  const hub = hubOf(pageKey);
  if (!hub) return [];
  return hub.children
    .filter((k) => pages[k])
    .map((k) => ({ path: pages[k].path, title: pages[k].title }));
}
