import { useMemo, useState } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { cn } from '@/utils/cn'
import { PIN_TYPES } from '@/config/constants'
import type { Pin } from '@/types'

interface TimelineProps {
  isOpen: boolean
  onClose: () => void
  pins: Pin[]
  onPinSelect: (pin: Pin) => void
}

type SortOrder = 'newest' | 'oldest'
type GroupBy = 'none' | 'month' | 'year'

export function Timeline({ isOpen, onClose, pins, onPinSelect }: TimelineProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [groupBy, setGroupBy] = useState<GroupBy>('month')

  const sortedPins = useMemo(() => {
    const sorted = [...pins].sort((a, b) => {
      const dateA = a.memoryDate ? new Date(a.memoryDate) : new Date(a.createdAt)
      const dateB = b.memoryDate ? new Date(b.memoryDate) : new Date(b.createdAt)
      return sortOrder === 'newest'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime()
    })
    return sorted
  }, [pins, sortOrder])

  const groupedPins = useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'all', label: '', pins: sortedPins }]
    }

    const groups: Record<string, { label: string; pins: Pin[] }> = {}

    for (const pin of sortedPins) {
      const date = pin.memoryDate ? parseISO(pin.memoryDate) : parseISO(pin.createdAt)
      if (!isValid(date)) continue

      let key: string
      let label: string

      if (groupBy === 'month') {
        key = format(date, 'yyyy-MM')
        label = format(date, 'MMMM yyyy')
      } else {
        key = format(date, 'yyyy')
        label = format(date, 'yyyy')
      }

      if (!groups[key]) {
        groups[key] = { label, pins: [] }
      }
      groups[key].pins.push(pin)
    }

    return Object.entries(groups).map(([key, value]) => ({
      key,
      label: value.label,
      pins: value.pins,
    }))
  }, [sortedPins, groupBy])

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-0 bottom-0 z-[1002] w-80 bg-white shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h3 className="font-bold text-neutral-800">Timeline</h3>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-2 p-3 border-b border-neutral-100">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="flex-1 px-2 py-1.5 text-sm bg-neutral-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className="flex-1 px-2 py-1.5 text-sm bg-neutral-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="month">By month</option>
          <option value="year">By year</option>
          <option value="none">No grouping</option>
        </select>
      </div>

      {/* Timeline content */}
      <div className="flex-1 overflow-y-auto">
        {sortedPins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 p-4">
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No memories yet</p>
          </div>
        ) : (
          <div className="p-3">
            {groupedPins.map(({ key, label, pins: groupPins }) => (
              <div key={key} className="mb-4">
                {label && (
                  <div className="sticky top-0 bg-white py-2 mb-2">
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      {label}
                    </h4>
                    <div className="text-xs text-neutral-400">{groupPins.length} memories</div>
                  </div>
                )}
                <div className="relative pl-4 border-l-2 border-primary-200 space-y-3">
                  {groupPins.map((pin) => (
                    <TimelineItem key={pin.id} pin={pin} onClick={() => onPinSelect(pin)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-500">
        <span className="font-medium">{pins.length}</span> memories total
      </div>
    </div>
  )
}

interface TimelineItemProps {
  pin: Pin
  onClick: () => void
}

function TimelineItem({ pin, onClick }: TimelineItemProps) {
  const pinConfig = PIN_TYPES[pin.pinType]
  const date = pin.memoryDate ? parseISO(pin.memoryDate) : parseISO(pin.createdAt)
  const hasMedia = pin.media && pin.media.length > 0
  const firstMedia = hasMedia ? pin.media[0] : null

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full text-left p-3 rounded-xl bg-white border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all',
        'before:absolute before:-left-[21px] before:top-4 before:w-3 before:h-3 before:rounded-full before:border-2 before:border-white',
        'before:bg-primary-500'
      )}
    >
      <div className="flex gap-3">
        {/* Thumbnail or Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden',
            !firstMedia && 'bg-neutral-100'
          )}
          style={!firstMedia ? { backgroundColor: pin.color + '20' } : undefined}
        >
          {firstMedia ? (
            <img
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${firstMedia.thumbnailPath || firstMedia.filePath}`}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl">{pin.icon}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{pinConfig?.icon}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: pin.color + '20', color: pin.color }}
            >
              {pinConfig?.label || pin.pinType}
            </span>
          </div>
          <h5 className="font-medium text-neutral-800 truncate text-sm">
            {pin.title}
          </h5>
          {pin.description && (
            <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
              {pin.description}
            </p>
          )}
          <div className="text-xs text-neutral-400 mt-1">
            {isValid(date) ? format(date, 'MMM d, yyyy') : 'No date'}
            {hasMedia && (
              <span className="ml-2">
                {pin.media.length} photo{pin.media.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

interface TimelineButtonProps {
  onClick: () => void
  pinCount: number
}

export function TimelineButton({ onClick, pinCount }: TimelineButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-neutral-600 hover:text-primary-500 transition-colors relative"
      title="View timeline"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {pinCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
          {pinCount > 99 ? '99+' : pinCount}
        </span>
      )}
    </button>
  )
}
