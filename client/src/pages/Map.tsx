import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { MapView, MapControls, PinMarker, PinEditor, LocateControl, PartnerCursor, DrawingCanvas, DrawingToolbar, PlaceSearch, PinFilters, FilterButton, applyPinFilter, type PinFilter, type GeoStroke, type DrawingCanvasRef, Timeline, TimelineButton, FlyTo, PinClusterGroup } from '@/components/map'
import { Button, Modal } from '@/components/ui'
import { NoPinsEmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { usePins } from '@/hooks/usePins'
import { useSocket } from '@/hooks/useSocket'
import { api } from '@/services/api'
import type { Pin, MapData } from '@/types'
import type { PinFormData } from '@/components/map/PinEditor'

interface Stroke {
  id: string
  points: Array<{ x: number; y: number }>
  color: string
  width: number
}

interface MapWithPinCount extends MapData {
  pinCount: number
}

interface MapSelectorProps {
  currentMap: MapWithPinCount | null
  onMapSelect: (mapId: string) => void
}

function MapSelector({ currentMap, onMapSelect }: MapSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [maps, setMaps] = useState<MapWithPinCount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && maps.length === 0) {
      setIsLoading(true)
      api.get<MapWithPinCount[]>('/maps')
        .then(setMaps)
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, maps.length])

  if (!currentMap) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-neutral-100 rounded-lg px-2 py-1 transition-colors"
      >
        <h1 className="font-bold text-neutral-800">{currentMap.name}</h1>
        <svg
          className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 min-w-[200px] z-50">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-neutral-500">Loading...</div>
          ) : maps.length === 0 ? (
            <div className="px-4 py-2 text-sm text-neutral-500">No maps found</div>
          ) : (
            maps.map(map => (
              <button
                key={map.id}
                onClick={() => {
                  onMapSelect(map.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center justify-between ${
                  map.id === currentMap.id ? 'bg-primary-50' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-neutral-800">{map.name}</div>
                  <div className="text-xs text-neutral-500">{map.pinCount} pins</div>
                </div>
                {map.id === currentMap.id && (
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))
          )}
          <div className="border-t border-neutral-100 mt-2 pt-2">
            <Link
              to="/maps"
              className="w-full px-4 py-2 text-left text-sm text-primary-600 hover:bg-primary-50 flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              View all maps
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function Map() {
  const { mapId } = useParams<{ mapId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [mapData, setMapData] = useState<MapWithPinCount | null>(null)
  const [isLoadingMap, setIsLoadingMap] = useState(true)
  const [clickPosition, setClickPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [editingPin, setEditingPin] = useState<Pin | null>(null)
  const [deletingPin, setDeletingPin] = useState<Pin | null>(null)
  const [partnerCursor, setPartnerCursor] = useState<{ lat: number; lng: number } | null>(null)
  const [isPartnerOnline, setIsPartnerOnline] = useState(false)

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [strokeColor, setStrokeColor] = useState('#E11D48')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [partnerStrokes, setPartnerStrokes] = useState<Stroke[]>([])
  const [savedDrawings, setSavedDrawings] = useState<GeoStroke[]>([])
  const [isSavingDrawings, setIsSavingDrawings] = useState(false)
  const drawingCanvasRef = useRef<DrawingCanvasRef>(null)

  // Filter state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [pinFilter, setPinFilter] = useState<PinFilter>({
    types: ['memory', 'wishlist', 'milestone', 'trip'],
    createdBy: 'all',
  })

  // Timeline state
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number } | null>(null)

  const {
    pins,
    isLoading: isPinsLoading,
    fetchPins,
    createPin,
    updatePin,
    deletePin,
    addPinLocally,
    removePinLocally,
    movePinLocally,
  } = usePins({ mapId: mapId! })

  const accessToken = localStorage.getItem('accessToken')

  const {
    isConnected,
    emitCursorMove,
    emitPinCreate,
    emitPinUpdate,
    emitPinDelete,
    emitStrokeStart,
    emitStrokeUpdate,
    emitStrokeEnd,
  } = useSocket({
    mapId: mapId!,
    accessToken,
    onPinCreated: useCallback((data: { userId: string; pin: Pin }) => {
      if (data.userId !== user?.id) {
        addPinLocally(data.pin)
        toast.info('Partner added a new pin!')
      }
    }, [addPinLocally, toast, user?.id]),
    onPinUpdated: useCallback((data: { userId: string; pin: Pin }) => {
      if (data.userId !== user?.id) {
        addPinLocally(data.pin)
      }
    }, [addPinLocally, user?.id]),
    onPinDeleted: useCallback((data: { userId: string; pinId: string }) => {
      if (data.userId !== user?.id) {
        removePinLocally(data.pinId)
      }
    }, [removePinLocally, user?.id]),
    onPinMoved: useCallback((data: { userId: string; pinId: string; lat: number; lng: number }) => {
      if (data.userId !== user?.id) {
        movePinLocally(data.pinId, data.lat, data.lng)
      }
    }, [movePinLocally, user?.id]),
    onPartnerCursor: useCallback((data: { userId: string; lat: number; lng: number }) => {
      if (data.userId !== user?.id) {
        setPartnerCursor({ lat: data.lat, lng: data.lng })
      }
    }, [user?.id]),
    onPartnerJoined: useCallback((data: { userId: string; email: string }) => {
      if (data.userId !== user?.id) {
        setIsPartnerOnline(true)
        toast.info('Partner is now viewing the map')
      }
    }, [toast, user?.id]),
    onPartnerLeft: useCallback(() => {
      setIsPartnerOnline(false)
      setPartnerCursor(null)
    }, []),
    onStrokeStarted: useCallback((data: { userId: string; strokeId: string; color: string; width: number }) => {
      if (data.userId !== user?.id) {
        setPartnerStrokes(prev => [...prev, { id: data.strokeId, points: [], color: data.color, width: data.width }])
      }
    }, [user?.id]),
    onStrokeUpdated: useCallback((data: { userId: string; strokeId: string; points: Array<{ x: number; y: number }> }) => {
      if (data.userId !== user?.id) {
        setPartnerStrokes(prev => prev.map(s => s.id === data.strokeId ? { ...s, points: data.points } : s))
      }
    }, [user?.id]),
    onStrokeEnded: useCallback((data: { userId: string; strokeId: string }) => {
      if (data.userId !== user?.id) {
        // Keep the stroke visible
      }
    }, [user?.id]),
  })

  useEffect(() => {
    if (!mapId) return

    const loadMap = async () => {
      try {
        const data = await api.get<MapWithPinCount>(`/maps/${mapId}`)
        setMapData(data)
      } catch {
        toast.error('Failed to load map')
        navigate('/maps')
      } finally {
        setIsLoadingMap(false)
      }
    }

    const loadDrawings = async () => {
      try {
        const drawings = await api.get<GeoStroke[]>(`/maps/${mapId}/drawings`)
        setSavedDrawings(drawings)
      } catch {
        // Silently fail - drawings are not critical
        console.error('Failed to load drawings')
      }
    }

    loadMap()
    fetchPins()
    loadDrawings()
  }, [mapId, fetchPins, navigate, toast])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isDrawingMode) return
    setClickPosition({ lat, lng })
  }, [isDrawingMode])

  const handleDrawingToggle = useCallback(async () => {
    if (isDrawingMode) {
      // Exiting drawing mode - save all unsaved strokes
      const unsavedStrokes = drawingCanvasRef.current?.getStrokes() || []
      if (unsavedStrokes.length > 0 && mapId) {
        setIsSavingDrawings(true)
        try {
          // Save each stroke to the database
          for (const stroke of unsavedStrokes) {
            const saved = await api.post<GeoStroke>(`/maps/${mapId}/drawings`, {
              pathData: stroke.pathData,
              strokeColor: stroke.strokeColor,
              strokeWidth: stroke.strokeWidth,
            })
            setSavedDrawings(prev => [...prev, saved])
          }
          // Clear local strokes after saving
          drawingCanvasRef.current?.clearStrokes()
        } catch {
          toast.error('Failed to save drawings')
        } finally {
          setIsSavingDrawings(false)
        }
      }
    }
    setIsDrawingMode(prev => !prev)
  }, [isDrawingMode, mapId, toast])

  const handleStrokeStart = useCallback((strokeId: string, color: string, width: number) => {
    emitStrokeStart(strokeId, color, width)
  }, [emitStrokeStart])

  const handleStrokeUpdate = useCallback((strokeId: string, points: Array<{ x: number; y: number }>) => {
    emitStrokeUpdate(strokeId, points)
  }, [emitStrokeUpdate])

  const handleStrokeEnd = useCallback((strokeId: string, geoStroke: GeoStroke) => {
    emitStrokeEnd(strokeId)
    // Note: We don't save to DB here - we batch save when exiting drawing mode
  }, [emitStrokeEnd])

  const handleClearDrawing = useCallback(async () => {
    setPartnerStrokes([])
    drawingCanvasRef.current?.clearStrokes()

    // Also clear saved drawings from database
    if (mapId && savedDrawings.length > 0) {
      try {
        await api.delete(`/maps/${mapId}/drawings`)
        setSavedDrawings([])
      } catch {
        toast.error('Failed to clear saved drawings')
      }
    }
  }, [mapId, savedDrawings.length, toast])

  const handleCreatePin = async (formData: PinFormData) => {
    if (!clickPosition) return

    try {
      const newPin = await createPin(clickPosition, formData)
      emitPinCreate(newPin)
      setClickPosition(null)
      toast.success('Pin added!')
    } catch {
      toast.error('Failed to add pin')
    }
  }

  const handleEditPin = (pin: Pin) => {
    setEditingPin(pin)
  }

  const handleTimelinePinSelect = (pin: Pin) => {
    setFlyToTarget({ lat: pin.lat, lng: pin.lng })
    setIsTimelineOpen(false)
    // Open the pin for editing after flying to it
    setTimeout(() => {
      setEditingPin(pin)
    }, 1100)
  }

  const handleUpdatePin = async (formData: PinFormData) => {
    if (!editingPin) return

    try {
      const updatedPin = await updatePin(editingPin.id, formData)
      emitPinUpdate(updatedPin)
      setEditingPin(null)
      toast.success('Pin updated!')
    } catch {
      toast.error('Failed to update pin')
    }
  }

  const handleDeletePin = (pin: Pin) => {
    setDeletingPin(pin)
  }

  const confirmDeletePin = async () => {
    if (!deletingPin) return

    try {
      await deletePin(deletingPin.id)
      emitPinDelete(deletingPin.id)
      setDeletingPin(null)
      toast.success('Pin deleted')
    } catch {
      toast.error('Failed to delete pin')
    }
  }

  const handleCursorMove = useCallback((lat: number, lng: number) => {
    emitCursorMove(lat, lng)
  }, [emitCursorMove])

  if (isLoadingMap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-pulse text-primary-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link to="/maps" className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <MapSelector
              currentMap={mapData}
              onMapSelect={(newMapId) => navigate(`/map/${newMapId}`)}
            />
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
              <span>{pins.length} pins</span>
              {isConnected && (
                <>
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isPartnerOnline ? 'bg-success-500' : 'bg-neutral-300'}`} />
                    {isPartnerOnline ? 'Partner online' : 'Partner offline'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          center={mapData ? [mapData.centerLat, mapData.centerLng] : undefined}
          zoom={mapData?.zoomLevel}
          onMapClick={handleMapClick}
          onCenterChange={handleCursorMove}
        >
          <MapControls
            onDrawingToggle={handleDrawingToggle}
            isDrawing={isDrawingMode}
          />
          <LocateControl />
          <FlyTo
            lat={flyToTarget?.lat ?? null}
            lng={flyToTarget?.lng ?? null}
            onComplete={() => setFlyToTarget(null)}
          />
          <PlaceSearch
            className="absolute left-4 top-4 z-[1000] w-72"
            onPlaceSelect={(lat, lng) => {
              setClickPosition({ lat, lng })
            }}
          />

          <PinClusterGroup
            pins={applyPinFilter(pins, pinFilter, user?.id)}
            onPinClick={handleEditPin}
            onPinEdit={handleEditPin}
            onPinDelete={handleDeletePin}
          />

          {partnerCursor && (
            <PartnerCursor
              lat={partnerCursor.lat}
              lng={partnerCursor.lng}
              name="Partner"
            />
          )}

          <DrawingCanvas
            ref={drawingCanvasRef}
            isDrawing={isDrawingMode}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            savedDrawings={savedDrawings}
            onStrokeStart={handleStrokeStart}
            onStrokeUpdate={handleStrokeUpdate}
            onStrokeEnd={handleStrokeEnd}
            partnerStrokes={partnerStrokes}
            onClear={handleClearDrawing}
          />
        </MapView>

        {/* Drawing toolbar */}
        <DrawingToolbar
          isVisible={isDrawingMode}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          onColorChange={setStrokeColor}
          onWidthChange={setStrokeWidth}
          onClear={handleClearDrawing}
          onClose={handleDrawingToggle}
          isSaving={isSavingDrawings}
        />

        {/* Filter and Timeline buttons */}
        <div className="absolute left-4 bottom-4 z-[1000] flex flex-col gap-2">
          <TimelineButton
            onClick={() => setIsTimelineOpen(!isTimelineOpen)}
            pinCount={pins.length}
          />
          <FilterButton
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            hasActiveFilters={
              pinFilter.types.length < 4 ||
              pinFilter.dateFrom !== undefined ||
              pinFilter.dateTo !== undefined ||
              pinFilter.createdBy !== 'all'
            }
          />
        </div>

        {/* Pin filters panel */}
        <PinFilters
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          filter={pinFilter}
          onFilterChange={setPinFilter}
          userId={user?.id}
        />

        {/* Timeline panel */}
        <Timeline
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          pins={pins}
          onPinSelect={handleTimelinePinSelect}
        />

        {/* Empty state overlay */}
        {!isPinsLoading && pins.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg pointer-events-auto">
              <NoPinsEmptyState />
            </div>
          </div>
        )}
      </div>

      {/* Pin Editor for new pin */}
      <PinEditor
        isOpen={!!clickPosition}
        onClose={() => setClickPosition(null)}
        onSave={handleCreatePin}
        position={clickPosition || undefined}
      />

      {/* Pin Editor for editing */}
      <PinEditor
        isOpen={!!editingPin}
        onClose={() => setEditingPin(null)}
        onSave={handleUpdatePin}
        pin={editingPin || undefined}
      />

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deletingPin}
        onClose={() => setDeletingPin(null)}
        title="Delete Pin"
        size="sm"
      >
        <p className="text-neutral-600 mb-6">
          Are you sure you want to delete "{deletingPin?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeletingPin(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeletePin}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
