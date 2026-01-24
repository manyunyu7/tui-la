import { useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { PIN_TYPES } from '@/config/constants'
import type { Pin } from '@/types'

interface PinEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: PinFormData) => void
  pin?: Pin
  position?: { lat: number; lng: number }
  isLoading?: boolean
}

export interface PinFormData {
  title: string
  description: string
  pinType: 'memory' | 'wishlist' | 'milestone' | 'trip'
  icon: string
  color: string
  memoryDate?: string
}

const EMOJI_OPTIONS = ['📍', '❤️', '💑', '🏠', '🍽️', '☕', '🎬', '🎵', '🏖️', '⛰️', '✈️', '🚗', '🎁', '🎂', '💍', '🌸']
const COLOR_OPTIONS = ['#E11D48', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export function PinEditor({
  isOpen,
  onClose,
  onSave,
  pin,
  position,
  isLoading,
}: PinEditorProps) {
  const [formData, setFormData] = useState<PinFormData>({
    title: pin?.title || '',
    description: pin?.description || '',
    pinType: pin?.pinType || 'memory',
    icon: pin?.icon || '📍',
    color: pin?.color || '#E11D48',
    memoryDate: pin?.memoryDate ? new Date(pin.memoryDate).toISOString().split('T')[0] : '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const updateField = <K extends keyof PinFormData>(field: K, value: PinFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pin ? 'Edit Pin' : 'Add New Pin'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Give this place a name"
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="What makes this place special?"
            rows={3}
            className="w-full px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 transition-all duration-150 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
          />
        </div>

        {/* Pin Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(PIN_TYPES) as [keyof typeof PIN_TYPES, typeof PIN_TYPES[keyof typeof PIN_TYPES]][]).map(([type, config]) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  updateField('pinType', type)
                  updateField('icon', config.icon)
                  updateField('color', config.color)
                }}
                className={`p-3 rounded-xl border-2 text-center transition-colors ${
                  formData.pinType === type
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span className="text-xl block mb-1">{config.icon}</span>
                <span className="text-xs text-neutral-600">{config.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => updateField('icon', emoji)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-colors ${
                  formData.icon === emoji
                    ? 'bg-primary-100 ring-2 ring-primary-500'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateField('color', color)}
                className={`w-10 h-10 rounded-xl transition-all ${
                  formData.color === color ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Date (optional)
          </label>
          <input
            type="date"
            value={formData.memoryDate}
            onChange={(e) => updateField('memoryDate', e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl text-neutral-800 transition-all duration-150 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Location info */}
        {position && (
          <div className="text-xs text-neutral-400 bg-neutral-50 rounded-lg p-2">
            Location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={!formData.title.trim()}>
            {pin ? 'Save Changes' : 'Add Pin'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
