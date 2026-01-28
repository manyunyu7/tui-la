import { useState, useEffect, useRef } from 'react'
import { api } from '@/services/api'
import { Avatar } from '@/components/ui'
import { cn } from '@/utils/cn'
import type { CommentWithUser } from '@/types'

interface CommentThreadProps {
  pinId: string
  userId?: string
}

export function CommentThread({ pinId, userId }: CommentThreadProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await api.get<CommentWithUser[]>(`/pins/${pinId}/comments`)
        setComments(data)
      } catch {
        console.error('Failed to load comments')
      } finally {
        setIsLoading(false)
      }
    }
    loadComments()
  }, [pinId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = inputValue.trim()
    if (!content || isSubmitting) return

    setIsSubmitting(true)
    try {
      const comment = await api.post<CommentWithUser>(`/pins/${pinId}/comments`, { content })
      setComments(prev => [...prev, comment])
      setInputValue('')
    } catch {
      console.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      await api.delete(`/pins/${pinId}/comments/${commentId}`)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {
      console.error('Failed to delete comment')
    }
  }

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-neutral-700 text-sm flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Comments {comments.length > 0 && `(${comments.length})`}
      </h4>

      {isLoading ? (
        <div className="text-sm text-neutral-400">Loading comments...</div>
      ) : (
        <>
          {/* Comments list */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2 group">
                <Avatar name={comment.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-700">
                      {comment.displayName}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {formatTime(comment.createdAt)}
                    </span>
                    {comment.userId === userId && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-error-500 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 break-words">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSubmitting}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-xl transition-colors',
                inputValue.trim()
                  ? 'bg-primary-500 text-white hover:bg-primary-400'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              )}
            >
              Post
            </button>
          </form>
        </>
      )}
    </div>
  )
}
