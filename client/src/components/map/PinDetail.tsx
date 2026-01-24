import { useState } from 'react'
import { Button, Lightbox } from '@/components/ui'
import { PIN_TYPES } from '@/config/constants'
import type { Pin } from '@/types'

interface PinDetailProps {
  pin: Pin
  onEdit?: () => void
  onDelete?: () => void
  onClose?: () => void
}

export function PinDetail({ pin, onEdit, onDelete, onClose }: PinDetailProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const pinTypeConfig = PIN_TYPES[pin.pinType]
  const photos = pin.media?.filter(m => m.type === 'image') || []
  const formattedDate = pin.memoryDate
    ? new Date(pin.memoryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <div className="max-w-md">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: pin.color + '20' }}
        >
          {pin.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-neutral-800 truncate">{pin.title}</h3>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: pinTypeConfig.color + '20',
                color: pinTypeConfig.color,
              }}
            >
              {pinTypeConfig.label}
            </span>
            {formattedDate && (
              <>
                <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                <span>{formattedDate}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {pin.description && (
        <p className="text-neutral-600 text-sm mb-4 whitespace-pre-wrap">
          {pin.description}
        </p>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div className="mb-4">
          {photos.length === 1 ? (
            <div
              className="rounded-xl overflow-hidden cursor-pointer"
              onClick={() => openLightbox(0)}
            >
              <img
                src={photos[0].filePath}
                alt=""
                className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
              />
            </div>
          ) : photos.length === 2 ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="rounded-xl overflow-hidden cursor-pointer aspect-square"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={photo.thumbnailPath || photo.filePath}
                    alt=""
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((photo, index) => (
                <div
                  key={photo.id}
                  className="rounded-xl overflow-hidden cursor-pointer aspect-square relative"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={photo.thumbnailPath || photo.filePath}
                    alt=""
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                  {index === 5 && photos.length > 6 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                      +{photos.length - 6}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-100">
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="flex-1">
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="sm" onClick={onDelete} className="flex-1 text-error-500 hover:bg-error-50">
            Delete
          </Button>
        )}
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Close
          </Button>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        images={photos.map(p => ({ url: p.filePath, alt: p.originalName }))}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
