import { useMap } from 'react-leaflet'
import { cn } from '@/utils/cn'

interface MapControlsProps {
  onDrawingToggle?: () => void
  isDrawing?: boolean
  className?: string
  onFitBounds?: () => void
  hasPins?: boolean
  onExport?: () => void
  isExporting?: boolean
}

export function MapControls({ onDrawingToggle, isDrawing, className, onFitBounds, hasPins, onExport, isExporting }: MapControlsProps) {
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

      {/* Export button */}
      {onExport && (
        <button
          onClick={onExport}
          disabled={isExporting}
          className={cn(
            'w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-colors',
            isExporting
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-white text-neutral-600 hover:text-primary-500'
          )}
          title="Export map as image"
        >
          {isExporting ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
