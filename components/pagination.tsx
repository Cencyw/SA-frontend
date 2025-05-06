"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
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

  return (
    <Pagination className="my-6">
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
  )
}
