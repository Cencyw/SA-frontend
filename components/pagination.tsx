"use client"

import type React from "react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
}

export default function PaginationControls({
                                             currentPage,
                                             totalPages,
                                             onPageChange,
                                             onPageSizeChange,
                                             pageSizeOptions = [8, 16, 24, 32],
                                             showPageSizeSelector = false,
                                           }: PaginationControlsProps) {
  const [inputPage, setInputPage] = useState<string>(currentPage.toString())

  // 当currentPage变化时更新输入框
  useEffect(() => {
    setInputPage(currentPage.toString())
  }, [currentPage])

  // 生成页码数组
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5 // 最多显示的页码数量

    if (totalPages <= maxPagesToShow) {
      // 如果总页数小于等于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 总是显示第一页
      pages.push(1)

      // 计算中间页码的范围
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // 调整以确保我们显示正确数量的页码
      if (startPage === 2) endPage = Math.min(totalPages - 1, startPage + 2)
      if (endPage === totalPages - 1) startPage = Math.max(2, endPage - 2)

      // 添加省略号
      if (startPage > 2) pages.push(-1) // -1 表示省略号

      // 添加中间页码
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // 添加省略号
      if (endPage < totalPages - 1) pages.push(-2) // -2 表示省略号

      // 总是显示最后一页
      pages.push(totalPages)
    }

    return pages
  }

  // 处理页码输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value)
  }

  // 处理页码输入提交
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNum = Number.parseInt(inputPage)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum)
    } else {
      setInputPage(currentPage.toString())
    }
  }

  // 处理页面大小变化
  const handlePageSizeChange = (value: string) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number.parseInt(value))
    }
  }

  return (
      <div className="flex flex-col items-center space-y-4">
        <Pagination className="my-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) onPageChange(currentPage - 1)
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === -1 || pageNum === -2) {
                return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                )
              }

              return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          onPageChange(pageNum)
                        }}
                        isActive={pageNum === currentPage}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) onPageChange(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center space-x-4 text-sm">
          <form onSubmit={handleInputSubmit} className="flex items-center space-x-2">
            <span>跳转到</span>
            <input
                type="text"
                value={inputPage}
                onChange={handleInputChange}
                className="w-12 h-8 border rounded text-center"
                aria-label="页码输入"
            />
            <span>页</span>
            <button type="submit" className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" aria-label="跳转">
              确定
            </button>
          </form>

          {showPageSizeSelector && onPageSizeChange && (
              <div className="flex items-center space-x-2">
                <span>每页显示</span>
                <Select defaultValue={pageSizeOptions[0].toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue placeholder="选择数量" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>条</span>
              </div>
          )}
        </div>
      </div>
  )
}
