/** 收代碼、s/代碼或整串網址；代碼大小寫不同就是不同連結，原樣保留 */
export const shareCodeFrom = (input: string) =>
  input.trim().match(/(?:^|\/)([A-Za-z0-9]{8})\/?$/)?.[1] ?? null;
