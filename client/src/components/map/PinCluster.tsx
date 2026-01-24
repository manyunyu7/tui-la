import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import type { Pin } from '@/types'
import { PinMarker } from './PinMarker'

interface PinClusterGroupProps {
  pins: Pin[]
  onPinClick?: (pin: Pin) => void
  onPinEdit?: (pin: Pin) => void
  onPinDelete?: (pin: Pin) => void
  onPinMove?: (pin: Pin, lat: number, lng: number) => void
  enableClustering?: boolean
  selectedPins?: string[]
}

// Create a custom cluster icon
function createClusterIcon(cluster: L.MarkerCluster) {
  const childCount = cluster.getChildCount()
  let size = 'small'
  let bgColor = '#F43F5E'

  if (childCount >= 100) {
    size = 'large'
    bgColor = '#BE123C'
  } else if (childCount >= 10) {
    size = 'medium'
    bgColor = '#E11D48'
  }

  const sizes = {
    small: { container: 36, font: 12 },
    medium: { container: 44, font: 14 },
    large: { container: 52, font: 16 },
  }

  const { container, font } = sizes[size as keyof typeof sizes]

  return L.divIcon({
    html: `
      <div style="
        width: ${container}px;
        height: ${container}px;
        background-color: ${bgColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${font}px;
        box-shadow: 0 4px 12px rgba(244, 63, 94, 0.4);
        border: 3px solid white;
        transition: transform 0.2s;
      ">
        ${childCount}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(container, container),
    iconAnchor: L.point(container / 2, container / 2),
  })
}

export function PinClusterGroup({
  pins,
  onPinClick,
  onPinEdit,
  onPinDelete,
  onPinMove,
  enableClustering = true,
  selectedPins,
}: PinClusterGroupProps) {
  if (!enableClustering || pins.length < 10) {
    // Don't cluster for small numbers of pins
    return (
      <>
        {pins.map((pin) => (
          <PinMarker
            key={pin.id}
            pin={pin}
            onClick={onPinClick}
            onEdit={onPinEdit}
            onDelete={onPinDelete}
            onMove={onPinMove}
            isSelected={selectedPins?.includes(pin.id)}
          />
        ))}
      </>
    )
  }

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterIcon}
      maxClusterRadius={60}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      zoomToBoundsOnClick
      disableClusteringAtZoom={16}
      animate
    >
      {pins.map((pin) => (
        <PinMarker
          key={pin.id}
          pin={pin}
          onClick={onPinClick}
          onEdit={onPinEdit}
          onDelete={onPinDelete}
          onMove={onPinMove}
          isSelected={selectedPins?.includes(pin.id)}
        />
      ))}
    </MarkerClusterGroup>
  )
}
