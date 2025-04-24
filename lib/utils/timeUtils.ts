// 格式化時間為 "HH:MM" 或 "HH:MM:SS" 格式
export function formatTime(
  date: Date,
  includeSeconds: boolean = false,
): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return includeSeconds
    ? `${hours}:${minutes}:${seconds}`
    : `${hours}:${minutes}`;
}

// 將時間轉換為人類可讀的文字格式
export function timeToText(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  let timeText = `${hours} 點`;
  if (minutes > 0) {
    timeText += ` ${minutes} 分`;
  }

  return timeText;
}

// 生成多個不同的時間選項，確保其中包含正確答案
export function generateTimeChoices(
  correctTime: Date,
  numberOfChoices: number = 4,
): string[] {
  const choices: string[] = [timeToText(correctTime)];
  const correctHours = correctTime.getHours();
  const correctMinutes = correctTime.getMinutes();

  // 生成與正確答案不同的其他選項
  while (choices.length < numberOfChoices) {
    // 隨機生成在正確時間附近的時間
    let hours = correctHours;
    let minutes = correctMinutes;

    // 有 70% 的機率只改變分鐘，30% 的機率改變小時
    if (Math.random() < 0.3) {
      // 改變小時，在 ±3 小時內
      hours = (hours + Math.floor(Math.random() * 7) - 3 + 24) % 24;
    } else {
      // 改變分鐘，在 ±20 分鐘內
      minutes = (minutes + Math.floor(Math.random() * 41) - 20 + 60) % 60;
    }

    const newTime = new Date(correctTime);
    newTime.setHours(hours);
    newTime.setMinutes(minutes);

    const timeOption = timeToText(newTime);

    // 確保沒有重複選項
    if (!choices.includes(timeOption)) {
      choices.push(timeOption);
    }
  }

  // 打亂選項順序
  return choices.sort(() => Math.random() - 0.5);
}
