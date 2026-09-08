"use client"
import { useEffect, useState } from "react"

import { Button } from "@/components/atoms/shadcn/button"

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
            ? "網路回來了，按下面的按鈕回首頁。"
            : "現在連不上網路，檢查一下 Wi-Fi 或行動網路。"
          }
        </p>

        {isOnline ? (
          <Button className="mb-4" onClick={() => (window.location.href = "/")}>
            返回首頁
          </Button>
        ) : (
          <Button className="mb-4" onClick={handleRetry}>
            重試 {retryCount > 0 && `(${retryCount})`}
          </Button>
        )}
        <div className="text-sm text-gray-500 mt-8">
          <p>看到的內容可能是之前存下來的</p>
          <p>網路恢復後會自動更新</p>
        </div>
      </div>
    </div>
  )
}
