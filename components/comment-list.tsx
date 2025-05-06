import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Comment } from "@/lib/types"
import { Star } from "lucide-react"

interface CommentListProps {
  comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-center py-8 text-gray-500">暂无评论</p>
  }

  return (
    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
      {comments.map((comment) => (
        <div key={comment.id} className="pb-4 border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-3 mb-2">
            <Avatar>
              <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{comment.user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{comment.user.name}</p>
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4" fill={i < comment.rating ? "currentColor" : "none"} />
                ))}
              </div>
            </div>
            <p className="text-gray-500 text-sm ml-auto">{comment.date}</p>
          </div>
          <p className="text-gray-700">{comment.content}</p>

          {comment.images && comment.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {comment.images.map((image, index) => (
                <div key={index} className="relative h-16 w-16 rounded overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`评论图片 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
