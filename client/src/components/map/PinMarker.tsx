import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { Pin } from '@/types'
import { format } from 'date-fns'

interface PinMarkerProps {
  pin: Pin
  onClick?: (pin: Pin) => void
  onEdit?: (pin: Pin) => void
  onDelete?: (pin: Pin) => void
  onMove?: (pin: Pin, lat: number, lng: number) => void
  draggable?: boolean
}

export function PinMarker({ pin, onClick, onEdit, onDelete, onMove, draggable = true }: PinMarkerProps) {
  const icon = createPinIcon(pin.icon, pin.color)

  return (
    <Marker
      position={[pin.lat, pin.lng]}
      icon={icon}
      draggable={draggable}
      eventHandlers={{
        click: () => onClick?.(pin),
        dragend: (e) => {
          const marker = e.target
          const position = marker.getLatLng()
          onMove?.(pin, position.lat, position.lng)
        },
      }}
    >
      <Popup className="pin-popup">
        <div className="min-w-[200px]">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-2xl">{pin.icon}</span>
            <div className="flex-1">
              <h3 className="font-bold text-neutral-800">{pin.title}</h3>
              {pin.memoryDate && (
                <p className="text-xs text-neutral-500">
                  {format(new Date(pin.memoryDate), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>

          {pin.description && (
            <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
              {pin.description}
            </p>
          )}

          {pin.media && pin.media.length > 0 && (
            <div className="mb-3">
              <img
                src={pin.media[0].thumbnailPath || pin.media[0].filePath}
                alt=""
                className="w-full h-24 object-cover rounded-lg"
              />
              {pin.media.length > 1 && (
                <p className="text-xs text-neutral-400 mt-1 text-center">
                  +{pin.media.length - 1} more photos
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(pin)}
                className="flex-1 py-1.5 px-3 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(pin)}
                className="py-1.5 px-3 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

function createPinIcon(emoji: string, color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        border: 3px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 18px;
        ">${emoji}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

interface PartnerCursorProps {
  lat: number
  lng: number
  name: string
  avatarUrl?: string
}

export function PartnerCursor({ lat, lng, name, avatarUrl }: PartnerCursorProps) {
  const icon = L.divIcon({
    className: 'partner-cursor',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${avatarUrl ? `url(${avatarUrl})` : 'linear-gradient(135deg, #F43F5E, #E11D48)'};
          background-size: cover;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${avatarUrl ? '' : name.charAt(0).toUpperCase()}
        </div>
        <div style="
          background: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          margin-top: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          white-space: nowrap;
        ">${name}</div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })

  return <Marker position={[lat, lng]} icon={icon} interactive={false} />
}
