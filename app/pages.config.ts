export interface Page {
  path: string;
  imageSrc: string;
  /** 單元說明區的插圖；未指定時，從封面的 warm 版對應到 cutout 版。 */
  illustrationSrc?: string;
  blurDataURL: string;
  title: string;
  /** 介紹頁的大字標語，也是首頁卡片的副標。一句短話，說孩子或老師在這裡做什麼 */
  slogan: string;
  /** 介紹頁大標下的完整說明，也是單元說明區與 llms.txt 的段落。寫成吸引人的樣子，操作細節放 FAQ */
  intro: string;
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
    "給台灣孩子的互動教材：認識新臺幣、看懂時鐘、算找零，還有老師上課用得到的小工具",
};

const pagesConfig = {
  "coin-introduction": {
    path: "/coin/introduction",
    imageSrc: "/images/covers/warm/coin-introduction-v2.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afry5v/++gEBAwAEC//otf304Qkmafz7+gL//voB6LAAAwn/+OkB6bIJAtvk17j9AQcEBgYK9hhdCPjf9/sAydkL7+bOoMLea2sGAeXgz9Tj6jEQ4g8SHvYLN0hGRgECArGtowLZ496+xayTv9v4+BoQDwI3NTAGBAEICAgB/vXq+/z78PPvEQoOAQgH2tnc+fn5LzEvbK1MgAx6lX0AAAAASUVORK5CYII=",
    title: "認識新臺幣",
    slogan: "硬幣和鈔票，一個一個認識",
    intro:
      "硬幣有大有小，有銀色也有金色，每張鈔票的圖案都不一樣。點開一枚翻到背面看看，順便算算一個 5 元可以換幾個 1 元。",
    guide: "點一下硬幣或鈔票，看它的特色和可以換成哪些錢。",
  },
  "coin-equivalent": {
    path: "/coin/equivalent",
    imageSrc: "/images/covers/warm/coin-equivalent.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afvz5v8A/wQICMnHywMDAisrKAYFBf/+/gIAAQH6+vv/AAKvsbaHi5P9/wAAAP///wACAgQE8fP1uLe92dvb/v37x8rU5ujwBAYFAv3+Bv/twS8X3wQFDOrt9hgAyRUBz/z9BgIBAf3e6gnh8xYMCgQREQ/u8fbJys7/AAAE//z3PURRAAQF0dbpAAD/N0lk/Pv7A//1HVJMKd1FXYIAAAAASUVORK5CYII=",
    title: "金錢等值換算",
    slogan: "一樣多的錢，有好多種湊法",
    intro:
      "一張 100 元可以換成兩個 50 元，也可以換成十個 10 元。讓孩子自己把錢拆開再湊回去，多換幾次就知道：錢換了樣子，還是一樣多。",
  },
  "coin-value": {
    path: "/coin/value",
    imageSrc: "/images/covers/warm/coin-value.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Af726gAAAAABAfDv8AkJCQQEBAMEAwD//wIAAAD9/f0BBwqlqq9gZm7i4+MBBAb+/v4E////BAUEAPv2tre53+PpFBcZAP79AQEBAv8A//j9Aoyevujt9PDo19bPw/4CAv7+/wQDCgy/uLz69u8xLSgYDffHyMgABA84PD0B/vrt7+vtEhAL1tnf7e/0JCMhCQgEDxEQOfRHae+m0N4AAAAASUVORK5CYII=",
    title: "計算金錢價值",
    slogan: "這堆錢總共多少？",
    intro:
      "一把零錢倒在桌上，總共多少錢？一個一個數、一個一個加，把課本上的加法拿到錢上來練。",
  },
  "coin-pay": {
    path: "/coin/pay",
    imageSrc: "/images/covers/warm/coin-pay.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Af3y5QIFBQAIB//19v7+/v///wICAgAAAAIBBgfg4OKHgova3N4DCAkEAwjj7vsBAQACAQEACggIk5me3N3hAAQCgqeP7/PfAQYJBAAEBbC1uPX19svJxczXv4OspxoGEzApMwQA//8uKyk+OzdQUVELDAxhUWgEBgT+9/QB/fTn//7+9PT1Dw8PAAgHAP39AP///vn64LdDPhyNjO4AAAAASUVORK5CYII=",
    title: "付款",
    slogan: "從錢包挑出剛好的錢",
    intro:
      "老闆說 37 元，錢包裡要拿哪幾個？讓孩子從自己的錢包挑出剛好的錢，跟出門買東西時要做的事一樣。",
  },
  "coin-buy": {
    path: "/coin/buy",
    imageSrc: "/images/covers/warm/coin-buy.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afzv4wMGBQADBAD7+wD//wAHBgD8/f37+wQBCAjY19mfp602IR0VBQMDJSYTDAsmJyUA//To7eLXFRUVgn14///19evi8+jd/PDkAgAHB8vO0Pf39iYmJquFe3iHke30/gMFAgIA/v4YFhYxLy4wKyaszd3VzskD/PIAAQMB/PDkAAAA7e7vDAwLCgwMAAAA/fr6AAAAKC5DHUTkuowAAAAASUVORK5CYII=",
    title: "購物",
    slogan: "自己挑、自己算、自己付",
    intro:
      "想買什麼自己挑，總共多少自己算，錢也自己付，跟真的去商店買東西一樣。",
  },
  "coin-change": {
    path: "/coin/change",
    imageSrc: "/images/covers/warm/coin-change.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afry4////wUFA/3/CP3wyQEB/gANNwH+9gL+/v8BBATm5+r49u8G/twBBBEDAf4AAAECBwsL1NLTZWx5rayn8/P0+gUh9fj2AAEBAufq7wwZIw8MCJujsNrqHOnx9bzT6wMGAwQAAAH3+frl5eVZVlY0P1337+AfNBr9+v0B/PPjAwwKtK+3HBoYLC8r/fn6AQECAQEAkqhI3D5W4b8AAAAASUVORK5CYII=",
    title: "找零",
    slogan: "付 50 元，該找多少？",
    intro:
      "付 50 元買 37 元的東西，該找回多少？要先減、再湊錢，是金錢單元裡最難的一關。會算找零，買東西時就知道有沒有被找錯錢。",
  },
  "clock-current-time": {
    path: "/clock/current-time",
    imageSrc: "/images/covers/warm/clock-current-time.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afzt3fz08wcZHebl5MPEyOvr7CoqJ0FAPQH769r+8vH3DxW7ubr6+/o9OjXf3+L9AAICBBESqMPMZGZu3d/hJyQh2tzfJyYi3NzeAv39AdnV2MPGyxUUEjM7NSgmIwICAgEBAQLKxsawtbqPiX4aGBfTy9AFBQPNz9MpKCYB29PFDAwLCgoJ+/3+ubm98/T1LCsoOzs4ADhLCbN8cRcAAAAASUVORK5CYII=",
    title: "學習讀時鐘",
    slogan: "看看現在幾點幾分",
    intro:
      "時針停在 3 和 4 中間，到底是幾點？把分針轉一圈，看時針跟著慢慢走一格，孩子就比較好懂。",
    guide: "拖動指針或下方的滑桿來調整時間。",
  },
  memory: {
    path: "/memory",
    imageSrc: "/images/covers/warm/memory.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afny57K4wvr6+U5NTf//ALO0swcHB05IPgT8/Pyor7nz+whGIuf/AAGfrt4PB/lKRDsEBgYFDAsJAfn+Ahg8/v79Eg/pDQoNBQQDBP39/hISEQj39nyTtwIECZh8TwEDB/v+AwT///7Z3OHy9PUDAP0DChb+6QEDBg3/FCsEAwMEXVRI/f79AgEC/f79CCxQ/f38Afvv/UdFcv1UWGwAAAAASUVORK5CYII=",
    title: "翻牌配對",
    slogan: "翻兩張牌，找出一對",
    intro:
      "翻兩張牌，配成一對就留著，不是就蓋回去。卡片上放什麼由老師決定，生字配注音、動物配英文、圖片配名稱都行，今天教什麼就翻什麼。",
  },
  wheel: {
    path: "/draw/wheel",
    imageSrc: "/images/covers/warm/wheel-v2.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afbv4QEBAf/9/gYSEOng1/n18x8rN/nw8AH58eP9/PwGEBDpo7QC53cFDPP07XAYdW0E8vT1iY2XNjUlQt+L8t3n/A0KAPeD/+42Av39/LK1ut7b2Qsn8QMODf0CEA4sAAH+8wL//gAuKSNMVlzw3Wz+9vIKE+XozFEAFD4B9/Di9vb3AwQDCAoO/+zBAPz0ABNDAAMDerRNsypywywAAAAASUVORK5CYII=",
    title: "抽籤轉盤",
    slogan: "轉吧！神奇轉盤",
    intro:
      "一按下去，全班都盯著轉盤，看它越轉越慢，最後停在誰身上。點名、分組、抽題目都交給轉盤，抽到誰就是誰。",
  },
  gacha: {
    path: "/draw/gacha",
    imageSrc: "/images/covers/warm/gacha.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Affv4f7+/woJAwAFB/nmywQPJgEFDvr5+AL//gAKDAm0x+ORqMgCDRnn6e3h4uQCAwIEBwkEvs/ne5mn3t8M6Ow01rqWNjg4e3t0AgIHA77T6ggPKSoU9tHg7Pn7/PLy8/8BAQL++P5WNxXu7O3N6+1dRiJOSUULCgkA/f0B+O/jAAD8zs/S/PsALCojAQQHAwMDBwYFp+FHEotb85QAAAAASUVORK5CYII=",
    title: "扭蛋機",
    slogan: "挑一顆扭蛋，打開看是什麼",
    intro:
      "請學生上台挑一顆扭蛋，抽出名字、題目或獎品，打開之前，誰也不知道內容是什麼。",
  },
  ichiban: {
    path: "/draw/ichiban",
    imageSrc: "/images/covers/warm/ichiban-ticket-apple-transparent.png",
    illustrationSrc: "/images/covers/warm/ichiban-ticket-apple-transparent.png",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Affw5f//AAEAAP7//gUGCgIB/QMFBfr4+AQBAQACAgD7AQEJAwnu69bBxtvs7fBbWVMC+v0C+fXvC9jA7OzT+PjujpKay8zOCA0QAuHr9ziB3lOY5iZr1MLqNFZNQsnN0PHu7QQbEQUyJRD/Az51EgIpFPgRKStjXwz8+fkB+PDlBwkDAAQAAAICAPb8+/8DBQcG9/T1heZHJwNihoAAAAAASUVORK5CYII=",
    title: "一番賞",
    slogan: "撕開票券，看抽到哪一賞",
    intro:
      "獎項老師自己排，學生挑一張票，按住封條慢慢撕，全班一起看 A 賞還在不在。",
  },
  monopoly: {
    path: "/monopoly",
    imageSrc: "/images/covers/warm/monopoly.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afvy4wD//wQIBwAEBPbt6QQFCQMEBf///gQBAQH7/v6rp60UFBMuKSETFgz///8AAAAB+vHiAgUEREhTFBQVoJ+XBwH9//8AAQEAAv/+/QMJEiUwNwIJBwsOCQQEBgMCAgD/AAIBBAz+4J54Es4u+Qt5oMqqt6Pv8/ADBAQEAQD//gAKHyw2RBglwgwKDw0T/v7+/wAAMTk1XGL75+0AAAAASUVORK5CYII=",
    title: "教學大富翁",
    slogan: "最多 20 人同樂的教學大富翁",
    intro:
      "擲骰子、買地、蓋房子，只是想買地要先答對題目。把這學期的複習題放進去，期末複習就能邊玩邊上。",
    guide: "老師先匯入 Excel 題庫並設定規則，再開始遊戲。",
  },
  timer: {
    path: "/timer",
    imageSrc: "/images/covers/warm/timer.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR42gGWAGn/Afbv5AkKBtPR1R0iLAkF/AcGBAABAvj4+AIICAS1y+iErMn94pkGBQPAxMnP0dMCAgIC0d/vw9rqlGNOBuro89qXg42drbCyBgoMAuPq9SIYDhUM9OgUXKfUGA0G+sPHzfXz8gRALxmEq9OS+xHX4u5oS1D+7e/Jz9X9/PwB+/Pn+fv9t8vkKR8QKx8P4uTrBgUEEhIRt8VNQdl18S8AAAAASUVORK5CYII=",
    title: "計時器",
    slogan: "上課用的倒數計時器",
    intro: "分組討論、限時作答、考試倒數，投影上去就能開始。",
  },
  noise: {
    path: "/noise",
    imageSrc: "/images/covers/warm/noise.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR42gGWAGn/Affw5QAAAP/+/gIFBvf29v/+/REWFffy8wIAAAD+/v8ABggFAP3k4t1udHyoqK0EBQUCAQAAChAP9MS77JuW/AH+tri8/Pr6BQsNAvr8AM/VvPG2f/fl7h0kLAUEA8jKzvLv7gLc5N6quq4EExkIFxbr6ekNDA3v8PD+/f0B8+3i/P37B//9//8DBAsL5ubnEhIRCgsLzVxOYMzmoBUAAAAASUVORK5CYII=",
    title: "噪音計",
    slogan: "教室太吵了嗎？",
    intro:
      "與其一直喊「小聲一點」，不如讓孩子自己看到音量。安靜時是綠色，太吵就變紅，投影在教室前面，孩子會開始提醒彼此。",
  },
  scoreboard: {
    path: "/scoreboard",
    imageSrc: "/images/covers/warm/scoreboard.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afjx5gQCAAMGCgACBPf4/gQC+wUD//j4+QT7/P3w+wLHybXv8epdNh7n8xHt9QcqJyEE2+fyhK7cBPzGDwHeYRjwtLoUtdAIraSRBAsIBmtHHvj5UR4O9PsWCS434KW+pvHv8QHl5N/Z5vMEAe0MBPYqE/zs9Q3i6/4wLScB+fLmAwIBAQAC/v8B/P4AAwIABQQC+Pn5chdKq+vAp1UAAAAASUVORK5CYII=",
    title: "計分板",
    slogan: "點一下，幫這組加分",
    intro:
      "不用再把分數寫在黑板角落擦擦改改。每組一張卡片，點一下就加分；想玩搶答，學生用手機掃 QR code 就能按鈴。",
  },
  multiplication: {
    path: "/multiplication",
    imageSrc: "/images/covers/warm/multiplication.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR42gGWAGn/Affw5QILDAD39QYGA/Pz9/Ly8xcXFvv7+wL99PPunpXpy8zM4fT29fZ2fIObn6QFBQUEAAMD+trY9g8c2AX84OTKuLq9IB8dAgcIAgEHDxx3Ze3vhNrTmjExKw8PDr7BxPTw7wL/BAQCBw3T6/bB0NAjIiJNS0hPS0gGBwcB9+/kAQID9/n3+fv5DgoO9PX0CgkJBgYGMvBI3uJSnLwAAAAASUVORK5CYII=",
    title: "九九乘法練習",
    slogan: "練習不熟悉的九九乘法",
    intro:
      "今天只想練 7 的乘法？那就只勾 7。錯的選項都是孩子常犯的錯，練完一輪就知道哪幾題還沒背熟。",
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
  /** 首頁卡片牆用：hub 取代旗下所有子頁，只露出一張卡當入口 */
  imageSrc: string;
  blurDataURL: string;
  /** 首頁卡片的副標，跟 Page.slogan 同一個位置 */
  slogan: string;
  /** 分類頁大標下的說明，也進 llms.txt */
  intro: string;
}

/**
 * 分類頁。刻意不放進 pages —— pages 會被首頁卡片牆與各頁的「其他教材」
 * 直接展開，hub 混進去會跟教材卡片長得一樣，語意也不對。
 */
export const hubs: Record<string, Hub> = {
  draw: {
    path: "/draw",
    // 畫面上就叫「抽籤」；「線上抽籤」這個搜尋字留在 pageSeo.draw.title 的 <title> 裡
    title: "抽籤",
    slogan: "轉盤、扭蛋機、一番賞，三種抽法",
    intro:
      "點名、分組、抽題，老師幾乎天天都要隨機選人。這裡有三種抽法，差在誰來選、結果怎麼打開。轉盤最快，貼上名單按一下，幾秒就停，一節課要抽好幾次的時候用它。扭蛋機會把名單變成一箱扭蛋，請學生上來自己挑一顆，打開才知道是誰。一番賞是老師先設好獎項，學生挑一張票親手撕開，適合拿來發獎勵。轉盤和扭蛋機的名單格式一樣，一行一個，最多 60 個，可以直接複製過去用。投影在電子白板上也看得清楚。",
    imageSrc: "/images/covers/warm/wheel-v2.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afbv4QEBAf/9/gYSEOng1/n18x8rN/nw8AH58eP9/PwGEBDpo7QC53cFDPP07XAYdW0E8vT1iY2XNjUlQt+L8t3n/A0KAPeD/+42Av39/LK1ut7b2Qsn8QMODf0CEA4sAAH+8wL//gAuKSNMVlzw3Wz+9vIKE+XozFEAFD4B9/Di9vb3AwQDCAoO/+zBAPz0ABNDAAMDerRNsypywywAAAAASUVORK5CYII=",
    children: ["wheel", "gacha", "ichiban"],
  },
  coin: {
    path: "/coin",
    title: "認識金錢",
    slogan: "從認識錢到算找零，六個單元由淺入深",
    intro:
      "金錢是國小數學裡最貼近生活的一塊，特教班的生活技能課也一定會教。我們把它拆成六個單元，一個單元只練一件事：先認得錢長什麼樣子，再知道同樣的金額有不同湊法，接著練加總、付款，最後才是最難的找零。用平板或電腦打開網頁就能玩。",
    imageSrc: "/images/covers/warm/coin-introduction-v2.webp",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAIAAABxZ0isAAAAoUlEQVR4nAGWAGn/Afry5v/++gEBAwAEC//otf304Qkmafz7+gL//voB6LAAAwn/+OkB6bIJAtvk17j9AQcEBgYK9hhdCPjf9/sAydkL7+bOoMLea2sGAeXgz9Tj6jEQ4g8SHvYLN0hGRgECArGtowLZ496+xayTv9v4+BoQDwI3NTAGBAEICAgB/vXq+/z78PPvEQoOAQgH2tnc+fn5LzEvbK1MgAx6lX0AAAAASUVORK5CYII=",
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
