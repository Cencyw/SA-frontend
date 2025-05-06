"use client"

import type React from "react"

import { useState } from "react"
import type { Address } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddressFormProps {
  initialAddress?: Partial<Address>
  onSubmit: (address: Address) => void
  submitButtonText?: string
  isSubmitting?: boolean
}

export default function AddressForm({
  initialAddress = {},
  onSubmit,
  submitButtonText = "保存地址",
  isSubmitting = false,
}: AddressFormProps) {
  const [address, setAddress] = useState<Partial<Address>>({
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    address: "",
    ...initialAddress,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({})

  const handleChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Address, string>> = {}

    if (!address.name?.trim()) {
      newErrors.name = "请输入收货人姓名"
    }

    if (!address.phone?.trim()) {
      newErrors.phone = "请输入联系电话"
    } else if (!/^1[3-9]\d{9}$/.test(address.phone)) {
      newErrors.phone = "请输入有效的手机号码"
    }

    if (!address.province?.trim()) {
      newErrors.province = "请选择省份"
    }

    if (!address.city?.trim()) {
      newErrors.city = "请选择城市"
    }

    if (!address.district?.trim()) {
      newErrors.district = "请选择区/县"
    }

    if (!address.address?.trim()) {
      newErrors.address = "请输入详细地址"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(address as Address)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            收货人姓名 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={address.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="请输入收货人姓名"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            联系电话 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            value={address.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="请输入联系电话"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="province">
            省份 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="province"
            value={address.province || ""}
            onChange={(e) => handleChange("province", e.target.value)}
            placeholder="请输入省份"
            className={errors.province ? "border-red-500" : ""}
          />
          {errors.province && <p className="text-red-500 text-sm">{errors.province}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">
            城市 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={address.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="请输入城市"
            className={errors.city ? "border-red-500" : ""}
          />
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">
            区/县 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="district"
            value={address.district || ""}
            onChange={(e) => handleChange("district", e.target.value)}
            placeholder="请输入区/县"
            className={errors.district ? "border-red-500" : ""}
          />
          {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          详细地址 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="address"
          value={address.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="请输入详细地址，如街道、门牌号等"
          className={errors.address ? "border-red-500" : ""}
          rows={3}
        />
        {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "提交中..." : submitButtonText}
      </Button>
    </form>
  )
}
