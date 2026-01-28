import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { cn } from '@/utils/cn'
import type { ReactionWithUser } from '@/types'

const REACTION_EMOJIS = ['❤️', '😍', '🥰', '😂', '🔥', '✨', '💋', '🎉']

interface ReactionPickerProps {
  pinId: string
  userId?: string
}

export function ReactionPicker({ pinId, userId }: ReactionPickerProps) {
  const [reactions, setReactions] = useState<ReactionWithUser[]>([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    const loadReactions = async () => {
      try {
        const data = await api.get<ReactionWithUser[]>(`/pins/${pinId}/reactions`)
        setReactions(data)
      } catch {
        // Silently fail
      }
    }
    loadReactions()
  }, [pinId])

  const handleToggleReaction = async (type: string) => {
    const existing = reactions.find(r => r.userId === userId && r.type === type)

    if (existing) {
      // Remove reaction
      try {
        await api.delete(`/pins/${pinId}/reactions/${type}`)
        setReactions(prev => prev.filter(r => r.id !== existing.id))
      } catch {
        console.error('Failed to remove reaction')
      }
    } else {
      // Add reaction
      try {
        const reaction = await api.post<ReactionWithUser>(`/pins/${pinId}/reactions`, { type })
        setReactions(prev => [...prev, reaction])
      } catch {
        console.error('Failed to add reaction')
      }
    }
    setShowPicker(false)
  }

  // Group reactions by type
  const grouped = reactions.reduce<Record<string, ReactionWithUser[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Existing reactions */}
      {Object.entries(grouped).map(([type, reacts]) => {
        const hasMyReaction = reacts.some(r => r.userId === userId)
        return (
          <button
            key={type}
            onClick={() => handleToggleReaction(type)}
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-sm border transition-colors',
              hasMyReaction
                ? 'bg-primary-50 border-primary-200'
                : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
            )}
          >
            <span>{type}</span>
            <span className="text-xs text-neutral-500">{reacts.length}</span>
          </button>
        )
      })}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-sm"
        >
          +
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-neutral-200 p-2 flex gap-1 z-50">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleToggleReaction(emoji)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
