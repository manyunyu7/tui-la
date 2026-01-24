import { useRef, useEffect, useState, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import { cn } from '@/utils/cn'

interface Point {
  x: number
  y: number
}

interface Stroke {
  id: string
  points: Point[]
  color: string
  width: number
}

interface DrawingCanvasProps {
  isDrawing: boolean
  strokeColor: string
  strokeWidth: number
  onStrokeStart?: (strokeId: string, color: string, width: number) => void
  onStrokeUpdate?: (strokeId: string, points: Point[]) => void
  onStrokeEnd?: (strokeId: string) => void
  partnerStrokes?: Stroke[]
  onClear?: () => void
}

export function DrawingCanvas({
  isDrawing,
  strokeColor,
  strokeWidth,
  onStrokeStart,
  onStrokeUpdate,
  onStrokeEnd,
  partnerStrokes = [],
  onClear,
}: DrawingCanvasProps) {
  const map = useMap()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const isDrawingRef = useRef(false)

  // Generate unique stroke ID
  const generateStrokeId = () => `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = useCallback((lat: number, lng: number) => {
    const point = map.latLngToContainerPoint([lat, lng])
    return { x: point.x, y: point.y }
  }, [map])

  // Convert canvas coordinates to lat/lng
  const canvasToLatLng = useCallback((x: number, y: number) => {
    const latLng = map.containerPointToLatLng([x, y])
    return { lat: latLng.lat, lng: latLng.lng }
  }, [map])

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all completed strokes
    const allStrokes = [...strokes, ...partnerStrokes]
    for (const stroke of allStrokes) {
      if (stroke.points.length < 2) continue

      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
      ctx.stroke()
    }

    // Draw current stroke
    if (currentStroke && currentStroke.points.length >= 2) {
      ctx.beginPath()
      ctx.strokeStyle = currentStroke.color
      ctx.lineWidth = currentStroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y)
      for (let i = 1; i < currentStroke.points.length; i++) {
        ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y)
      }
      ctx.stroke()
    }
  }, [strokes, partnerStrokes, currentStroke])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = map.getContainer()
    const resize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      redrawCanvas()
    }

    resize()
    window.addEventListener('resize', resize)
    map.on('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      map.off('resize', resize)
    }
  }, [map, redrawCanvas])

  // Redraw on strokes change
  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  // Handle map move/zoom - redraw strokes
  useEffect(() => {
    const handleMoveEnd = () => {
      redrawCanvas()
    }

    map.on('moveend', handleMoveEnd)
    map.on('zoomend', handleMoveEnd)

    return () => {
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', handleMoveEnd)
    }
  }, [map, redrawCanvas])

  // Drawing handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const strokeId = generateStrokeId()
    const newStroke: Stroke = {
      id: strokeId,
      points: [{ x, y }],
      color: strokeColor,
      width: strokeWidth,
    }

    setCurrentStroke(newStroke)
    isDrawingRef.current = true
    onStrokeStart?.(strokeId, strokeColor, strokeWidth)

    // Capture pointer for smooth drawing
    canvas.setPointerCapture(e.pointerId)
  }, [isDrawing, strokeColor, strokeWidth, onStrokeStart])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current || !currentStroke) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newPoints = [...currentStroke.points, { x, y }]
    setCurrentStroke({ ...currentStroke, points: newPoints })

    // Send update every few points for performance
    if (newPoints.length % 3 === 0) {
      onStrokeUpdate?.(currentStroke.id, newPoints)
    }
  }, [currentStroke, onStrokeUpdate])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current || !currentStroke) return

    const canvas = canvasRef.current
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId)
    }

    // Save stroke
    if (currentStroke.points.length >= 2) {
      setStrokes(prev => [...prev, currentStroke])
      onStrokeEnd?.(currentStroke.id)
    }

    setCurrentStroke(null)
    isDrawingRef.current = false
  }, [currentStroke, onStrokeEnd])

  // Clear all strokes
  const handleClear = useCallback(() => {
    setStrokes([])
    setCurrentStroke(null)
    onClear?.()
  }, [onClear])

  // Disable map interactions when drawing
  useEffect(() => {
    if (isDrawing) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      map.scrollWheelZoom.disable()
    } else {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
      map.scrollWheelZoom.enable()
    }

    return () => {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
      map.scrollWheelZoom.enable()
    }
  }, [isDrawing, map])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'absolute inset-0 z-[500]',
        isDrawing ? 'cursor-crosshair' : 'pointer-events-none'
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  )
}

interface DrawingToolbarProps {
  isVisible: boolean
  strokeColor: string
  strokeWidth: number
  onColorChange: (color: string) => void
  onWidthChange: (width: number) => void
  onClear: () => void
  onClose: () => void
}

const COLORS = [
  '#E11D48', // Rose
  '#F59E0B', // Amber
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#000000', // Black
  '#FFFFFF', // White
]

const WIDTHS = [2, 4, 6, 10]

export function DrawingToolbar({
  isVisible,
  strokeColor,
  strokeWidth,
  onColorChange,
  onWidthChange,
  onClear,
  onClose,
}: DrawingToolbarProps) {
  if (!isVisible) return null

  return (
    <div className="absolute left-4 top-4 z-[1001] bg-white rounded-xl shadow-lg p-3 space-y-3">
      {/* Colors */}
      <div>
        <p className="text-xs text-neutral-500 mb-2">Color</p>
        <div className="flex gap-1.5">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={cn(
                'w-7 h-7 rounded-full transition-transform',
                strokeColor === color ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110' : ''
              )}
              style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid #e5e7eb' : undefined }}
            />
          ))}
        </div>
      </div>

      {/* Width */}
      <div>
        <p className="text-xs text-neutral-500 mb-2">Size</p>
        <div className="flex gap-2">
          {WIDTHS.map(width => (
            <button
              key={width}
              onClick={() => onWidthChange(width)}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                strokeWidth === width
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: width + 2, height: width + 2 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-100">
        <button
          onClick={onClear}
          className="flex-1 py-2 px-3 text-sm text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 px-3 text-sm text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}
