import type { Product, Comment } from "./types"
import { logInfo, logWarning, logError } from "./debug-utils"

// API基础URL
const API_BASE_URL = "http://localhost:9090/api"

// 分页结果接口
export interface PageResult<T> {
  total: number
  page: number
  size: number
  items: T[]
}

// 获取分页产品列表
export async function fetchProducts(page = 1, size = 8): Promise<PageResult<Product>> {
  const url = `${API_BASE_URL}/product/products/page/${page}/size/${size}`
  logInfo(`开始从API获取产品列表`, { url, page, size })

  try {
    logInfo(`发送请求: GET ${url}`)
    const response = await fetch(url)

    logInfo(`收到响应`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "无法读取错误响应内容")
      logError(`API请求失败`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`API错误: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    logInfo(`成功解析响应数据`, {
      total: data.total,
      page: data.page,
      size: data.size,
      itemCount: Array.isArray(data.items) ? data.items.length : "未知(非数组)",
      sampleData: Array.isArray(data.items) && data.items.length > 0 ? data.items[0] : data,
    })

    // 验证数据结构
    if (!data.items || !Array.isArray(data.items)) {
      logWarning(`API返回的数据不包含有效的items数组`, { data })
      return {
        total: 0,
        page: page,
        size: size,
        items: [],
      }
    }

    // 检查数据格式
    if (data.items.length > 0) {
      const firstItem = data.items[0]
      if (!firstItem.id || !firstItem.name || typeof firstItem.price !== "number") {
        logWarning(`API返回的数据格式可能不符合预期`, { sampleItem: firstItem })
      }
    }

    return data as PageResult<Product>
  } catch (error) {
    logError(`获取产品列表失败`, {
      url,
      error:
          error instanceof Error
              ? {
                message: error.message,
                stack: error.stack,
              }
              : error,
    })
    throw error
  }
}

// 获取产品评论
export async function fetchProductReviews(productId: string) {
  const url = `${API_BASE_URL}/product/reviews/${productId}`
  logInfo(`开始获取产品评论`, { url, productId })

  try {
    logInfo(`发送请求: GET ${url}`)
    const response = await fetch(url)

    logInfo(`收到响应`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "无法读取错误响应内容")
      logError(`获取评论API请求失败`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`API错误: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    logInfo(`成功解析评论数据`, {
      commentCount: Array.isArray(data) ? data.length : "未知(非数组)",
      sampleData: Array.isArray(data) && data.length > 0 ? data[0] : data,
    })

    // 验证数据结构
    if (!Array.isArray(data)) {
      logWarning(`API返回的评论数据不是数组`, { data })
      return []
    }

    return data as Comment[]
  } catch (error) {
    logError(`获取产品评论失败`, {
      url,
      productId,
      error:
          error instanceof Error
              ? {
                message: error.message,
                stack: error.stack,
              }
              : error,
    })
    throw error
  }
}

// 获取单个产品详情（从已加载的产品列表中）
export async function fetchProductById(id: string, products: Product[]): Promise<Product> {
  logInfo(`从本地产品列表中查找产品`, { id, availableProducts: products.length })

  // 从已加载的产品列表中查找产品
  const product = products.find((p) => p.id === id)

  if (product) {
    logInfo(`成功找到产品`, { id, product })
    return product
  }

  logError(`未找到产品`, { id, availableProductIds: products.map((p) => p.id) })
  throw new Error(`未找到ID为 ${id} 的产品`)
}
