"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Info, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react"
import { debugContext, DebugLevel, type DebugInfo } from "@/lib/debug-utils"

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<DebugInfo[]>([])
  const [filter, setFilter] = useState<DebugLevel | "all">("all")

  // 每秒更新一次日志
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLogs(debugContext.getLogs())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  // 如果不在调试模式，不显示面板
  if (!debugContext.isInDebugMode()) {
    return null
  }

  // 过滤日志
  const filteredLogs = filter === "all" ? logs : logs.filter((log) => log.level === filter)

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full md:w-96 bg-white border-t border-l shadow-lg">
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between p-2 bg-gray-100 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
          <span className="font-medium">调试面板</span>
          <span className="ml-2 text-xs text-gray-500">
            ({logs.filter((l) => l.level === DebugLevel.ERROR).length} 错误,
            {logs.filter((l) => l.level === DebugLevel.WARNING).length} 警告)
          </span>
        </div>
        <div className="flex items-center">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* 日志内容 */}
      {isOpen && (
        <div className="p-2">
          {/* 过滤器 */}
          <div className="flex mb-2 space-x-2">
            <button
              className={`px-2 py-1 text-xs rounded ${filter === "all" ? "bg-gray-200" : "bg-gray-100"}`}
              onClick={() => setFilter("all")}
            >
              全部
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${filter === DebugLevel.ERROR ? "bg-red-200" : "bg-gray-100"}`}
              onClick={() => setFilter(DebugLevel.ERROR)}
            >
              错误
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${filter === DebugLevel.WARNING ? "bg-yellow-200" : "bg-gray-100"}`}
              onClick={() => setFilter(DebugLevel.WARNING)}
            >
              警告
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${filter === DebugLevel.INFO ? "bg-blue-200" : "bg-gray-100"}`}
              onClick={() => setFilter(DebugLevel.INFO)}
            >
              信息
            </button>
            <button className="ml-auto px-2 py-1 text-xs bg-gray-100 rounded" onClick={() => debugContext.clearLogs()}>
              清除
            </button>
          </div>

          {/* 日志列表 */}
          <div className="max-h-60 overflow-y-auto border rounded">
            {filteredLogs.length === 0 ? (
              <div className="p-4 text-center text-gray-500">暂无日志</div>
            ) : (
              <div className="divide-y">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-2 text-xs">
                    <div className="flex items-center">
                      {log.level === DebugLevel.ERROR && <AlertCircle className="w-3 h-3 mr-1 text-red-500" />}
                      {log.level === DebugLevel.WARNING && <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />}
                      {log.level === DebugLevel.INFO && <Info className="w-3 h-3 mr-1 text-blue-500" />}
                      <span className="font-medium">{log.message}</span>
                      <span className="ml-auto text-gray-400">{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                    {log.details && (
                      <pre className="mt-1 p-1 bg-gray-50 rounded overflow-x-auto">
                        {typeof log.details === "object" ? JSON.stringify(log.details, null, 2) : String(log.details)}
                      </pre>
                    )}
                    {/* 高亮显示评论API请求 */}
                    {log.message.includes("评论") && log.level === DebugLevel.INFO && (
                      <div className="mt-1 p-1 bg-blue-50 text-blue-700 rounded text-xs">评论API请求</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
