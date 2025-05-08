import type { Order, OrderFormData, OrderItem, OrderRequest, ItemRequest } from "./types"
import { logInfo, logError } from "./debug-utils"

const API_BASE_URL = "http://localhost:9090/api"

// 提交订单到后端
export async function submitOrder(orderData: {
  items: OrderItem[]
  totalAmount: number
  address: OrderFormData["address"]
  paymentMethod: string
  remark?: string
}): Promise<Order> {
  const url = `${API_BASE_URL}/order`

  logInfo("开始准备订单数据", { orderData })

  // 将前端订单数据转换为后端API所需的格式
  const orderRequest: OrderRequest = {
    address: {
      province: orderData.address.province,
      city: orderData.address.city,
      district: orderData.address.district,
      address: orderData.address.address,
    },
    phoneNumber: orderData.address.phone,
    recipientName: orderData.address.name,
    items: orderData.items.map(
        (item): ItemRequest => ({
          productId: item.productId,
          quantity: item.quantity,
        }),
    ),
  }

  logInfo("转换后的订单请求数据", { orderRequest })

  try {
    logInfo("开始提交订单", { url })

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderRequest),
    })

    logInfo("收到订单提交响应", {
      status: response.status,
      statusText: response.statusText,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "无法读取错误响应内容")
      logError("订单提交失败", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`订单提交失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    logInfo("订单提交成功", { orderId: data.id })

    return data as Order
  } catch (error) {
    logError("订单提交过程中出错", {
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

// 获取订单详情
export async function getOrderById(orderId: string): Promise<Order> {
  const url = `${API_BASE_URL}/order/${orderId}`

  logInfo("开始获取订单详情", { url, orderId })

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "无法读取错误响应内容")
      logError("获取订单详情失败", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`获取订单详情失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data as Order
  } catch (error) {
    logError("获取订单详情过程中出错", {
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
