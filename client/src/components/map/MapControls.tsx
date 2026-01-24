import { useMap } from 'react-leaflet'
import { cn } from '@/utils/cn'

interface MapControlsProps {
  onDrawingToggle?: () => void
  isDrawing?: boolean
  className?: string
  onFitBounds?: () => void
  hasPins?: boolean
}

export function MapControls({ onDrawingToggle, isDrawing, className, onFitBounds, hasPins }: MapControlsProps) {
  const map = useMap()

  const handleZoomIn = () => {
    map.zoomIn()
  }

  const handleZoomOut = () => {
    map.zoomOut()
  }

  return (
    <div className={cn('absolute right-4 top-4 z-[1000] flex flex-col gap-2', className)}>
      {/* Zoom controls */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
          title="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <div className="h-px bg-neutral-200" />
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
          title="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Fit to pins */}
      {onFitBounds && hasPins && (
        <button
          onClick={onFitBounds}
          className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-neutral-600 hover:text-primary-500 transition-colors"
          title="Fit map to all pins"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      )}

      {/* Drawing toggle */}
      {onDrawingToggle && (
        <button
          onClick={onDrawingToggle}
          className={cn(
            'w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-colors',
            isDrawing
              ? 'bg-primary-500 text-white'
              : 'bg-white text-neutral-600 hover:text-primary-500'
          )}
          title={isDrawing ? 'Stop drawing' : 'Start drawing'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
    </div>
  )
}
