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
    "目前付款金額不足，尚差 {} 元。",
    "哎唷～再湊個 {} 元就完美啦！加油加油💪",
    "少了 {} 元～我先幫你 hold 住，快去翻翻錢包吧！👛",
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
} as const;

const getRandomMessage = (messages: readonly string[]): string =>
  messages[Math.floor(Math.random() * messages.length)];

const replaceAmount = (message: string, amount?: number): string =>
  amount !== undefined ? message.replace(/{}/g, amount.toString()) : message;

type FeedbackType = keyof typeof feedbackMessages;

const feedbackStrategies = {
  correctpay: () => getRandomMessage(feedbackMessages.correctpay),
  overpay: (amount: number) =>
    replaceAmount(getRandomMessage(feedbackMessages.overpay), amount),
  underpay: (amount: number) =>
    replaceAmount(getRandomMessage(feedbackMessages.underpay), amount),
  coingameCorrect: (amount: number) =>
    replaceAmount(getRandomMessage(feedbackMessages.coingameCorrect), amount),
  coingameIncorrect: (amount: number) =>
    replaceAmount(getRandomMessage(feedbackMessages.coingameIncorrect), amount),
} as const;

const createFeedback = (type: FeedbackType, amount?: number): string => {
  const strategy = feedbackStrategies[type];
  return strategy(amount as number);
};

export const getRandomFeedback = (
  type: FeedbackType,
  amount?: number,
): string => createFeedback(type, amount);
