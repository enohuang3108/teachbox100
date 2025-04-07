import { Sparkles } from "lucide-react"

export default function CoinCharacter() {
  return (
    <div className="relative">
      {/* 閃光效果 */}
      <Sparkles className="absolute -top-6 -right-6 text-black w-5 h-5 md:w-6 md:h-6" />
      <Sparkles className="absolute -top-2 right-16 text-black w-5 h-5 md:w-6 md:h-6" />
      <Sparkles className="absolute bottom-0 right-0 text-black w-5 h-5 md:w-6 md:h-6" />

      {/* 硬幣角色 */}
      <div className="w-16 h-16 md:w-24 md:h-24 bg-yellow-400 rounded-full border-4 border-black relative">
        {/* 眼睛 */}
        <div className="absolute top-4 md:top-6 left-3 md:left-4 w-3 md:w-4 h-6 md:h-8 bg-black rounded-full"></div>
        <div className="absolute top-4 md:top-6 right-3 md:right-4 w-3 md:w-4 h-6 md:h-8 bg-black rounded-full"></div>

        {/* 笑容 */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 w-8 md:w-10 h-4 md:h-5 bg-black rounded-b-full"></div>

        {/* 硬幣側面效果 */}
        <div className="absolute -right-1 top-0 bottom-0 w-3 md:w-4 bg-yellow-500 rounded-r-full"></div>
      </div>
    </div>
  )
}

