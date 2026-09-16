// 扭蛋機的名單解析沿用轉盤的，格式完全一樣，兩邊共用同一組驗證規則。
// 球的半徑與物理佈局由 LotteryMachine 自己算（跟著 canvas 尺寸走），這裡不預先算幾何。
export { MAX_ENTRIES, MIN_ENTRIES, parseEntries, STARTER_TEXT, validateEntries } from "@/lib/wheel/game";
