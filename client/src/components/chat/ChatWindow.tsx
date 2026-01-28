import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/services/api'
import { cn } from '@/utils/cn'
import { Avatar } from '@/components/ui'
import type { ChatMessage } from '@/types'

interface ChatWindowProps {
  mapId: string
  isOpen: boolean
  onClose: () => void
  onSendMessage: (message: string) => void
  incomingMessage: ChatMessage | null
  isPartnerTyping: boolean
  onTyping: (isTyping: boolean) => void
}

export function ChatWindow({
  mapId,
  isOpen,
  onClose,
  onSendMessage,
  incomingMessage,
  isPartnerTyping,
  onTyping,
}: ChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoad = useRef(true)

  // Load messages when chat opens
  useEffect(() => {
    if (!isOpen || !mapId) return

    const loadMessages = async () => {
      setIsLoading(true)
      try {
        const data = await api.get<ChatMessage[]>(`/maps/${mapId}/chat?limit=50`)
        setMessages(data)
        setHasMore(data.length >= 50)
        isInitialLoad.current = true
      } catch {
        console.error('Failed to load chat messages')
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [isOpen, mapId])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isInitialLoad.current || messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: isInitialLoad.current ? 'auto' : 'smooth' })
      isInitialLoad.current = false
    }
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle incoming messages from partner
  useEffect(() => {
    if (incomingMessage) {
      setMessages(prev => [...prev, incomingMessage])
    }
  }, [incomingMessage])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || messages.length === 0) return

    const oldest = messages[0]
    try {
      const older = await api.get<ChatMessage[]>(
        `/maps/${mapId}/chat?limit=50&before=${oldest.createdAt}`
      )
      if (older.length < 50) setHasMore(false)
      setMessages(prev => [...older, ...prev])
    } catch {
      console.error('Failed to load older messages')
    }
  }, [hasMore, isLoading, messages, mapId])

  const handleSend = () => {
    const content = inputValue.trim()
    if (!content) return

    // Optimistic UI - add message immediately
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      mapId,
      userId: user?.id || '',
      content,
      messageType: 'text',
      metadata: {},
      displayName: user?.displayName || '',
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, optimisticMessage])
    onSendMessage(content)
    setInputValue('')
    onTyping(false)
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)

    // Send typing indicator
    onTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute right-4 bottom-4 z-[1000] w-80 h-[480px] bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-primary-50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-bold text-neutral-800">Chat</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-400 text-sm text-center px-4">
            No messages yet. Say hi to your partner!
          </div>
        ) : (
          <>
            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full text-center text-xs text-primary-500 py-2 hover:underline"
              >
                Load older messages
              </button>
            )}
            {messages.map((msg) => {
              const isOwn = msg.userId === user?.id

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    isOwn ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {!isOwn && (
                    <Avatar
                      name={msg.displayName}
                      size="sm"
                    />
                  )}
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-3 py-2',
                      isOwn
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                    )}
                  >
                    {!isOwn && (
                      <div className="text-xs font-medium text-neutral-500 mb-0.5">
                        {msg.displayName}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <div
                      className={cn(
                        'text-[10px] mt-0.5',
                        isOwn ? 'text-primary-200' : 'text-neutral-400'
                      )}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
            {isPartnerTyping && (
              <div className="flex gap-2 items-center">
                <Avatar name="Partner" size="sm" />
                <div className="bg-neutral-100 rounded-2xl rounded-bl-md px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
