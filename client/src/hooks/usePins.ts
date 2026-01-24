import { useState, useCallback } from 'react'
import { api } from '@/services/api'
import type { Pin } from '@/types'
import type { PinFormData } from '@/components/map/PinEditor'

interface UsePinsOptions {
  mapId: string
}

export function usePins({ mapId }: UsePinsOptions) {
  const [pins, setPins] = useState<Pin[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPins = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<Pin[]>(`/pins/map/${mapId}`)
      setPins(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pins')
    } finally {
      setIsLoading(false)
    }
  }, [mapId])

  const createPin = useCallback(async (
    position: { lat: number; lng: number },
    formData: PinFormData
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const newPin = await api.post<Pin>('/pins', {
        mapId,
        lat: position.lat,
        lng: position.lng,
        ...formData,
        memoryDate: formData.memoryDate || undefined,
      })
      setPins((prev) => [newPin, ...prev])
      return newPin
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pin')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [mapId])

  const updatePin = useCallback(async (pinId: string, formData: Partial<PinFormData>) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedPin = await api.put<Pin>(`/pins/${pinId}`, formData)
      setPins((prev) => prev.map((p) => (p.id === pinId ? updatedPin : p)))
      return updatedPin
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pin')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deletePin = useCallback(async (pinId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.delete(`/pins/${pinId}`)
      setPins((prev) => prev.filter((p) => p.id !== pinId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pin')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const movePin = useCallback(async (pinId: string, lat: number, lng: number) => {
    // Optimistic update
    setPins((prev) =>
      prev.map((p) => (p.id === pinId ? { ...p, lat, lng } : p))
    )
    try {
      const updatedPin = await api.put<Pin>(`/pins/${pinId}`, { lat, lng })
      setPins((prev) => prev.map((p) => (p.id === pinId ? updatedPin : p)))
      return updatedPin
    } catch (err) {
      // Revert optimistic update on error
      fetchPins()
      throw err
    }
  }, [fetchPins])

  const movePinLocally = useCallback((pinId: string, lat: number, lng: number) => {
    setPins((prev) =>
      prev.map((p) => (p.id === pinId ? { ...p, lat, lng } : p))
    )
  }, [])

  const addPinLocally = useCallback((pin: Pin) => {
    setPins((prev) => {
      const exists = prev.some((p) => p.id === pin.id)
      if (exists) {
        return prev.map((p) => (p.id === pin.id ? pin : p))
      }
      return [pin, ...prev]
    })
  }, [])

  const removePinLocally = useCallback((pinId: string) => {
    setPins((prev) => prev.filter((p) => p.id !== pinId))
  }, [])

  return {
    pins,
    isLoading,
    error,
    fetchPins,
    createPin,
    updatePin,
    deletePin,
    movePin,
    movePinLocally,
    addPinLocally,
    removePinLocally,
  }
}
