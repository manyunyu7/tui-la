import { useState, useEffect, useRef, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import { cn } from '@/utils/cn'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  class: string
}

interface PlaceSearchProps {
  onPlaceSelect?: (lat: number, lng: number, name: string) => void
  className?: string
}

export function PlaceSearch({ onPlaceSelect, className }: PlaceSearchProps) {
  const map = useMap()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search with debounce
  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      )
      const data: NominatimResult[] = await response.json()
      setResults(data)
      setIsOpen(data.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(value)
    }, 300)
  }

  // Handle place selection
  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    // Navigate map to location
    map.flyTo([lat, lng], 15)

    // Clear search
    setQuery('')
    setResults([])
    setIsOpen(false)

    // Notify parent
    onPlaceSelect?.(lat, lng, result.display_name)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Get icon for place type
  const getPlaceIcon = (result: NominatimResult) => {
    const type = result.class || result.type
    switch (type) {
      case 'amenity':
        return '🏪'
      case 'tourism':
        return '🏛️'
      case 'shop':
        return '🛍️'
      case 'leisure':
        return '🎭'
      case 'natural':
        return '🌳'
      case 'highway':
        return '🛤️'
      case 'building':
        return '🏢'
      case 'place':
        return '📍'
      default:
        return '📌'
    }
  }

  // Format display name
  const formatName = (name: string) => {
    const parts = name.split(', ')
    if (parts.length > 3) {
      return `${parts[0]}, ${parts[1]}, ${parts.slice(-2).join(', ')}`
    }
    return name
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search places..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 transition-all duration-150 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 shadow-sm"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <svg className="w-5 h-5 text-neutral-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50">
          {results.map((result, index) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className={cn(
                'w-full px-4 py-3 text-left flex items-start gap-3 transition-colors',
                index === selectedIndex
                  ? 'bg-primary-50'
                  : 'hover:bg-neutral-50'
              )}
            >
              <span className="text-lg mt-0.5">{getPlaceIcon(result)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-800 truncate">
                  {result.display_name.split(',')[0]}
                </div>
                <div className="text-sm text-neutral-500 truncate">
                  {formatName(result.display_name)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 3 && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 p-4 text-center text-neutral-500 z-50">
          No places found
        </div>
      )}
    </div>
  )
}
