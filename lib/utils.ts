import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// 自訂字級 token 要登記，不然 text-h3 會被當成顏色：蓋掉 text-primary-foreground、留下 Button 的 text-sm
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["display", "hero", "h1", "h2", "h3", "body", "body-lg", "caption"] }] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
