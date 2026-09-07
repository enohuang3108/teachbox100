const feedbackMessages = {
  correctpay: [
    "付款成功，謝謝光臨！",
    "太棒了！金額剛剛好！",
    "完美的付款，歡迎下次再來！",
    "結帳成功！你真是個算錢高手！",
    "結帳成功！讓我偷偷告訴你...你是今日最佳客人🏆",
  ],
  overpay: [
    "哎呀！多付了 {} 元～要不要加個滷蛋？🥚",
    "多了 {} 元，感覺你是來發紅包的！🧧",
    "哇嗚～大手筆，多出 {} 元，會不會太阿莎力？💸",
    "多付了 {} 元呢，這樣我會不好意思的！",
    "多給了 {} 元，真是大方呢！",
  ],
  underpay: [
    "還差 {} 元啦～這樣我會被老闆扣薪水 QQ",
    "錢不夠啊夥計，少了 {} 元，你是想賒帳嗎？😳",
    "還少 {} 元，再翻翻錢包。",
    "哎唷～再湊個 {} 元就完美啦！加油加油💪",
    "少了 {} 元～我先幫你 hold 住，快去翻翻錢包吧！👛",
  ],
  correctchange: [
    "找零正確，太棒了！",
    "剛剛好！這就是正確的找零金額！",
    "精準找零，你真是找零大師！",
    "做得好！找零金額完全正確！",
    "完美！這就是我們要找的零錢！",
  ],
  overchange: [
    "哎呀！多找了 {} 元",
    "找太多了！多給了 {} 元！",
    "等等！多算了 {} 元，再檢查一下吧！",
    "不對喔，多找了 {} 元！",
  ],
  underchange: [
    "還差 {} 元才對喔！客人會追出來的！",
    "錢不夠找啊，少了 {} 元！",
    "還差 {} 元，再補一點。",
    "再湊個 {} 元就正確了！",
    "少了 {} 元！仔細算算看！",
  ],
  coingameCorrect: [
    "算得真準！總共是 {} 元 👍",
    "好棒！{} 元算對了 🌟",
    "沒錯，就是 {} 元，你真聰明！",
    "完全正確！{} 元，你是數學小天才 ✨",
    "答對啦！{} 元，繼續保持！🎯",
  ],
  coingameIncorrect: [
    "答案是 {} 元喔，再算算看！",
    "可惜差一點！正確是 {} 元，下次先從大面額開始數試試看～💰",
    "再挑戰一次吧！正確是 {} 元～別急，我相信你！🔥",
    "快成功了！但這次應該是 {} 元～試著一步一步來 🐢",
    "加油，答案是 {} 元，慢慢數不要急！⏰",
  ],
  clockgameCorrect: [
    "答對了！現在是 {}，你是時間管理大師！⏰",
    "太厲害了！{} 完全正確，你是時間小天才！✨",
    "答對啦！現在是 {}，你一定是時間精靈！🧚",
    "完美！{} 完全正確，你根本是時鐘界的福爾摩斯！🔍",
  ],
  clockgameIncorrect: [
    "可惜差一點！現在是 {}，再試一次吧！💪",
    "再挑戰一次吧！現在是 {}，我相信你可以的！🌟",
    "快成功了！但這次應該是 {}，加油加油！🔥",
    "加油，現在是 {}，慢慢來不要急！🐢",
  ],
} as const;

const getRandomMessage = (messages: readonly string[]): string =>
  messages[Math.floor(Math.random() * messages.length)];

const replaceMsg = (feedback: string, message?: string | number): string =>
  message !== undefined
    ? feedback.replace(/{}/g, message.toString())
    : feedback;

type FeedbackType = keyof typeof feedbackMessages;

const feedbackStrategies = {
  correctpay: () => getRandomMessage(feedbackMessages.correctpay),
  overpay: (amount: number) =>
    replaceMsg(getRandomMessage(feedbackMessages.overpay), amount),
  underpay: (amount: number) =>
    replaceMsg(getRandomMessage(feedbackMessages.underpay), amount),
  correctchange: () => getRandomMessage(feedbackMessages.correctchange),
  overchange: (amount: number) =>
    replaceMsg(getRandomMessage(feedbackMessages.overchange), amount),
  underchange: (amount: number) =>
    replaceMsg(getRandomMessage(feedbackMessages.underchange), amount),
  coingameCorrect: (amount: number) =>
    replaceMsg(getRandomMessage(feedbackMessages.coingameCorrect), amount),
  coingameIncorrect: (amount: number) =>
    replaceMsg(getRandomMessage(feedbackMessages.coingameIncorrect), amount),
  clockgameCorrect: (message: string) =>
    replaceMsg(getRandomMessage(feedbackMessages.clockgameCorrect), message),
  clockgameIncorrect: (message: string) =>
    replaceMsg(getRandomMessage(feedbackMessages.clockgameIncorrect), message),
} as const;

const createFeedback = (
  type: FeedbackType,
  message?: string | number,
): string => {
  return (feedbackStrategies[type] as any)(message);
};

export const getRandomFeedback = (
  type: FeedbackType,
  message?: string | number,
): string => createFeedback(type, message);
