import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { PIN_TYPES } from '@/config/constants'
import { Button } from '@/components/ui'
import type { Pin } from '@/types'

type PinType = 'memory' | 'wishlist' | 'milestone' | 'trip'

interface BulkPinManagerProps {
  pins: Pin[]
  selectedPins: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onBulkDelete: (pinIds: string[]) => Promise<void>
  onBulkTypeChange: (pinIds: string[], newType: PinType) => Promise<void>
  onClose: () => void
  isOpen: boolean
}

export function BulkPinManager({
  pins,
  selectedPins,
  onSelectionChange,
  onBulkDelete,
  onBulkTypeChange,
  onClose,
  isOpen,
}: BulkPinManagerProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChangingType, setIsChangingType] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  const handleSelectAll = useCallback(() => {
    if (selectedPins.length === pins.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(pins.map(p => p.id))
    }
  }, [selectedPins.length, pins, onSelectionChange])

  const handleDelete = async () => {
    if (selectedPins.length === 0) return

    setIsDeleting(true)
    try {
      await onBulkDelete(selectedPins)
      onSelectionChange([])
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTypeChange = async (newType: PinType) => {
    if (selectedPins.length === 0) return

    setIsChangingType(true)
    try {
      await onBulkTypeChange(selectedPins, newType)
      setShowTypeSelector(false)
      onSelectionChange([])
    } finally {
      setIsChangingType(false)
    }
  }

  const handleExport = () => {
    const selectedPinData = pins.filter(p => selectedPins.includes(p.id))
    const exportData = selectedPinData.map(pin => ({
      title: pin.title,
      description: pin.description,
      type: pin.pinType,
      date: pin.memoryDate,
      lat: pin.lat,
      lng: pin.lng,
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pins-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  const typeEntries = Object.entries(PIN_TYPES) as [PinType, typeof PIN_TYPES[PinType]][]

  return (
    <div className="absolute right-4 bottom-4 z-[1001] bg-white rounded-xl shadow-lg border border-neutral-200 p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-neutral-800">Bulk Actions</h3>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Selection info */}
      <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">
            {selectedPins.length} of {pins.length} pins selected
          </span>
          <button
            onClick={handleSelectAll}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {selectedPins.length === pins.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all"
            style={{ width: `${(selectedPins.length / pins.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-neutral-500 mb-4">
        Click on pins on the map to select them, or use "Select all" above.
      </p>

      {/* Actions */}
      <div className="space-y-2">
        {/* Change type */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-between"
            disabled={selectedPins.length === 0 || isChangingType}
            onClick={() => setShowTypeSelector(!showTypeSelector)}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Change Type
            </span>
            <svg className={cn('w-4 h-4 transition-transform', showTypeSelector && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>

          {showTypeSelector && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 z-10">
              {typeEntries.map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  disabled={isChangingType}
                  className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-neutral-50 flex items-center gap-2"
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={selectedPins.length === 0}
          onClick={handleExport}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Selected
          </span>
        </Button>

        {/* Delete */}
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          disabled={selectedPins.length === 0 || isDeleting}
          onClick={handleDelete}
        >
          <span className="flex items-center gap-2">
            {isDeleting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Delete Selected
          </span>
        </Button>
      </div>
    </div>
  )
}

interface BulkSelectButtonProps {
  onClick: () => void
  isActive: boolean
  selectedCount: number
}

export function BulkSelectButton({ onClick, isActive, selectedCount }: BulkSelectButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-colors relative',
        isActive
          ? 'bg-primary-500 text-white'
          : 'bg-white text-neutral-600 hover:text-primary-500'
      )}
      title={isActive ? 'Exit bulk select mode' : 'Enter bulk select mode'}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
      {selectedCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center px-1">
          {selectedCount}
        </span>
      )}
    </button>
  )
}
