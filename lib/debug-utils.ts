// 调试级别
export enum DebugLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

// 调试信息结构
export interface DebugInfo {
  id: string
  timestamp: Date
  level: DebugLevel
  message: string
  details?: any
}

// 调试上下文
class DebugContext {
  private logs: DebugInfo[] = []
  private isDebugMode = false

  constructor() {
    // 检查是否在开发环境或者URL中包含debug参数
    this.isDebugMode =
      process.env.NODE_ENV === "development" ||
      (typeof window !== "undefined" && window.location.search.includes("debug=true"))
  }

  // 添加日志
  log(level: DebugLevel, message: string, details?: any) {
    const logEntry: DebugInfo = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      level,
      message,
      details,
    }

    this.logs.push(logEntry)

    // 在控制台输出日志
    if (this.isDebugMode) {
      const consoleMethod =
        level === DebugLevel.ERROR ? console.error : level === DebugLevel.WARNING ? console.warn : console.log

      consoleMethod(`[${level.toUpperCase()}] ${message}`, details || "")
    }

    // 保持日志数量在合理范围内
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }

    return logEntry.id
  }

  // 获取所有日志
  getLogs() {
    return [...this.logs]
  }

  // 获取最近的日志
  getRecentLogs(count = 10) {
    return this.logs.slice(-count)
  }

  // 清除日志
  clearLogs() {
    this.logs = []
  }

  // 检查是否处于调试模式
  isInDebugMode() {
    return this.isDebugMode
  }

  // 启用调试模式
  enableDebugMode() {
    this.isDebugMode = true
  }

  // 禁用调试模式
  disableDebugMode() {
    this.isDebugMode = false
  }
}

// 创建单例实例
export const debugContext = new DebugContext()

// 便捷日志函数
export const logInfo = (message: string, details?: any) => debugContext.log(DebugLevel.INFO, message, details)

export const logWarning = (message: string, details?: any) => debugContext.log(DebugLevel.WARNING, message, details)

export const logError = (message: string, details?: any) => debugContext.log(DebugLevel.ERROR, message, details)
