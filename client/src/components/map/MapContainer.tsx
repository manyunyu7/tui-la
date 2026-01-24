import { useEffect, useRef } from 'react'
import { MapContainer as LeafletMap, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/utils/cn'

// Fix for default markers not showing
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
})

export interface MapContainerProps {
  center?: [number, number]
  zoom?: number
  className?: string
  children?: React.ReactNode
  onMapClick?: (lat: number, lng: number) => void
  onCenterChange?: (lat: number, lng: number) => void
  onZoomChange?: (zoom: number) => void
}

export function MapView({
  center = [51.505, -0.09],
  zoom = 13,
  className,
  children,
  onMapClick,
  onCenterChange,
  onZoomChange,
}: MapContainerProps) {
  return (
    <LeafletMap
      center={center}
      zoom={zoom}
      className={cn('w-full h-full', className)}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEventHandler
        onMapClick={onMapClick}
        onCenterChange={onCenterChange}
        onZoomChange={onZoomChange}
      />
      {children}
    </LeafletMap>
  )
}

interface MapEventHandlerProps {
  onMapClick?: (lat: number, lng: number) => void
  onCenterChange?: (lat: number, lng: number) => void
  onZoomChange?: (zoom: number) => void
}

function MapEventHandler({ onMapClick, onCenterChange, onZoomChange }: MapEventHandlerProps) {
  useMapEvents({
    click: (e) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng)
    },
    moveend: (e) => {
      const center = e.target.getCenter()
      onCenterChange?.(center.lat, center.lng)
    },
    zoomend: (e) => {
      onZoomChange?.(e.target.getZoom())
    },
  })

  return null
}

interface MapControllerProps {
  center?: [number, number]
  zoom?: number
}

export function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap()
  const prevCenterRef = useRef(center)
  const prevZoomRef = useRef(zoom)

  useEffect(() => {
    if (center && (center[0] !== prevCenterRef.current?.[0] || center[1] !== prevCenterRef.current?.[1])) {
      map.setView(center, zoom ?? map.getZoom())
      prevCenterRef.current = center
    }
  }, [center, zoom, map])

  useEffect(() => {
    if (zoom !== undefined && zoom !== prevZoomRef.current) {
      map.setZoom(zoom)
      prevZoomRef.current = zoom
    }
  }, [zoom, map])

  return null
}

interface LocateControlProps {
  onLocate?: (lat: number, lng: number) => void
}

export function LocateControl({ onLocate }: LocateControlProps) {
  const map = useMap()

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 })
  }

  useMapEvents({
    locationfound: (e) => {
      onLocate?.(e.latlng.lat, e.latlng.lng)
    },
  })

  return (
    <div className="leaflet-bottom leaflet-right mb-24 mr-3">
      <div className="leaflet-control">
        <button
          onClick={handleLocate}
          className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-neutral-600 hover:text-primary-500 transition-colors"
          title="Find my location"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
