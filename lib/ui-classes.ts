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
