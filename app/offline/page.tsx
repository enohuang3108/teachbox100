"use client"
import { useEffect, useState } from "react"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // 監聽網路狀態
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // 初始檢查
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1)

    try {
      // 嘗試重新連線
      const response = await fetch("/", { method: "HEAD" })
      if (response.ok) {
        window.location.reload()
      }
    } catch {
      console.log("仍然離線")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br">
      <div className="text-center p-8 max-w-md">
        <div className={`w-4 h-4 rounded-full mx-auto mb-4 ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {isOnline ? "連線正常" : "目前離線"}
        </h1>

        <p className="text-gray-600 mb-6">
          {isOnline
            ? "偵測到網路連線，點選下方按鈕返回首頁"
            : "無法連接到網路，請檢查您的連線設定"
          }
        </p>

        {isOnline ?
          <button
            onClick={() => window.location.href = "/"}
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors mb-4"
          >
          返回首頁
          </button> :
          <button
            onClick={handleRetry}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors mb-4"
          >
          重試 {retryCount > 0 && `(${retryCount})`}
          </button>
        }
        <div className="text-sm text-gray-500 mt-8">
          <p>部分內容可能來自快取</p>
          <p>連線恢復後將自動更新</p>
        </div>
      </div>
    </div>
  )
}
