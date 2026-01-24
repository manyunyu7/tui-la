import { useState } from 'react'
import { cn } from '@/utils/cn'
import { PIN_TYPES } from '@/config/constants'
import { Button } from '@/components/ui'

type PinType = 'memory' | 'wishlist' | 'milestone' | 'trip'

export interface PinFilter {
  types: PinType[]
  dateFrom?: string
  dateTo?: string
  createdBy?: 'me' | 'partner' | 'all'
}

interface PinFiltersProps {
  isOpen: boolean
  onClose: () => void
  filter: PinFilter
  onFilterChange: (filter: PinFilter) => void
  userId?: string
}

export function PinFilters({ isOpen, onClose, filter, onFilterChange, userId }: PinFiltersProps) {
  const [localFilter, setLocalFilter] = useState<PinFilter>(filter)

  if (!isOpen) return null

  const handleTypeToggle = (type: PinType) => {
    const newTypes = localFilter.types.includes(type)
      ? localFilter.types.filter(t => t !== type)
      : [...localFilter.types, type]
    setLocalFilter({ ...localFilter, types: newTypes })
  }

  const handleApply = () => {
    onFilterChange(localFilter)
    onClose()
  }

  const handleReset = () => {
    const resetFilter: PinFilter = {
      types: ['memory', 'wishlist', 'milestone', 'trip'],
      createdBy: 'all',
    }
    setLocalFilter(resetFilter)
    onFilterChange(resetFilter)
    onClose()
  }

  const typeEntries = Object.entries(PIN_TYPES) as [PinType, typeof PIN_TYPES[PinType]][]

  return (
    <div className="absolute left-4 bottom-4 z-[1001] bg-white rounded-xl shadow-lg border border-neutral-200 p-4 w-72">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-neutral-800">Filter Pins</h3>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Pin Types */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          {typeEntries.map(([type, config]) => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors',
                localFilter.types.includes(type)
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-100 text-neutral-500'
              )}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Date Range
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={localFilter.dateFrom || ''}
            onChange={(e) => setLocalFilter({ ...localFilter, dateFrom: e.target.value || undefined })}
            className="flex-1 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-400"
            placeholder="From"
          />
          <input
            type="date"
            value={localFilter.dateTo || ''}
            onChange={(e) => setLocalFilter({ ...localFilter, dateTo: e.target.value || undefined })}
            className="flex-1 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-400"
            placeholder="To"
          />
        </div>
      </div>

      {/* Created By */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Created By
        </label>
        <div className="flex gap-2">
          {(['all', 'me', 'partner'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setLocalFilter({ ...localFilter, createdBy: option })}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm transition-colors capitalize',
                localFilter.createdBy === option
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-100">
        <Button variant="ghost" size="sm" onClick={handleReset} className="flex-1">
          Reset
        </Button>
        <Button size="sm" onClick={handleApply} className="flex-1">
          Apply
        </Button>
      </div>
    </div>
  )
}

interface FilterButtonProps {
  onClick: () => void
  hasActiveFilters: boolean
}

export function FilterButton({ onClick, hasActiveFilters }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-colors',
        hasActiveFilters
          ? 'bg-primary-500 text-white'
          : 'bg-white text-neutral-600 hover:text-primary-500'
      )}
      title="Filter pins"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      {hasActiveFilters && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white" />
      )}
    </button>
  )
}

export function applyPinFilter(pins: any[], filter: PinFilter, userId?: string): any[] {
  return pins.filter(pin => {
    // Filter by type
    if (!filter.types.includes(pin.pinType)) {
      return false
    }

    // Filter by date
    if (filter.dateFrom && pin.memoryDate) {
      if (new Date(pin.memoryDate) < new Date(filter.dateFrom)) {
        return false
      }
    }
    if (filter.dateTo && pin.memoryDate) {
      if (new Date(pin.memoryDate) > new Date(filter.dateTo)) {
        return false
      }
    }

    // Filter by creator
    if (filter.createdBy === 'me' && pin.createdBy !== userId) {
      return false
    }
    if (filter.createdBy === 'partner' && pin.createdBy === userId) {
      return false
    }

    return true
  })
}
