export interface User {
  id: string
  name: string
  avatar: string
}

export interface Comment {
  id: string
  user: User
  rating: number
  content: string
  date: string
  images?: string[]
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  brand: string
  category: string
  stock: number
  comments: Comment[]
}

// 订单相关类型定义
export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
}

export interface Address {
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  isDefault?: boolean
}

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  address: Address
  status: OrderStatus
  createdAt: string
  updatedAt: string
  paymentMethod: string
  remark?: string
}

export interface OrderFormData {
  address: Address
  paymentMethod: string
  remark?: string
}

// 后端API请求类型
export interface ItemRequest {
  productId: string
  quantity: number
}

export interface OrderRequest {
  id?: string
  address: {
    province: string
    city: string
    district: string
    address: string
  }
  phoneNumber: string
  recipientName: string
  items: ItemRequest[]
}
