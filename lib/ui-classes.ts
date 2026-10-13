/**
 * 跨元件共用的 class 組合。只放「同一個視覺狀態出現在多個元件」的東西 ——
 * 單一元件用得到的組合留在元件裡，搬過來只會讓人多跳一個檔案。
 */

/**
 * RadioGroup 選項的選取態。改版前每個選項各有一個顏色（藍／紫／橘），
 * 但顏色沒有編碼任何意思 —— 選項之間的差別是文字，不是色相。
 */
export const SELECTED_OPTION =
  "group-has-[span[data-state=checked]]:bg-secondary group-has-[span[data-state=checked]]:border-ink hover:bg-accent";

/** 同組回答等寬等高；欄數與間距由各遊戲的空間決定。 */
export const ANSWER_GRID = "grid auto-rows-fr items-stretch";
export const ANSWER_CONTENT =
  "h-auto min-w-0 whitespace-normal text-balance break-words";

/** 1–6 字中等、7 字以上較小。雙隊棋盤依場地縮放，避免擠出隊伍欄。 */
export function answerTextClass(answer: string | number, scale: "page" | "board" = "page") {
  const short = Array.from(String(answer)).length <= 6;
  if (scale === "board") {
    return short
      ? "!text-[clamp(1.05rem,1.8cqw,2rem)]"
      : "!text-[clamp(1rem,1.5cqw,1.75rem)]";
  }
  return short ? "!text-h1" : "!text-h2";
}
