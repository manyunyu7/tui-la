import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { MapView, MapControls, PinMarker, PinEditor, LocateControl, PartnerCursor } from '@/components/map'
import { Button, Modal } from '@/components/ui'
import { NoPinsEmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { usePins } from '@/hooks/usePins'
import { useSocket } from '@/hooks/useSocket'
import { api } from '@/services/api'
import type { Pin, MapData } from '@/types'
import type { PinFormData } from '@/components/map/PinEditor'

interface MapWithPinCount extends MapData {
  pinCount: number
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

    loadMap()
    fetchPins()
  }, [mapId, fetchPins, navigate, toast])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setClickPosition({ lat, lng })
  }, [])

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
            <h1 className="font-bold text-neutral-800">{mapData?.name}</h1>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
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
          <MapControls />
          <LocateControl />

          {pins.map((pin) => (
            <PinMarker
              key={pin.id}
              pin={pin}
              onClick={handleEditPin}
              onEdit={handleEditPin}
              onDelete={handleDeletePin}
            />
          ))}

          {partnerCursor && (
            <PartnerCursor
              lat={partnerCursor.lat}
              lng={partnerCursor.lng}
              name="Partner"
            />
          )}
        </MapView>

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
