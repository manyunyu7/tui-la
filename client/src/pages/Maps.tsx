import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Card, CardTitle, Modal, Input } from '@/components/ui'
import { NoMapsEmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/services/api'
import type { MapData } from '@/types'

interface MapWithPinCount extends MapData {
  pinCount: number
}

export function Maps() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [maps, setMaps] = useState<MapWithPinCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    fetchMaps()
  }, [])

  const fetchMaps = async () => {
    try {
      const data = await api.get<MapWithPinCount[]>('/maps')
      setMaps(data)
    } catch (err) {
      console.error('Failed to fetch maps:', err)
      toast.error('Failed to load maps')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateMap = async (name: string, type: 'shared' | 'solo_trip') => {
    try {
      const newMap = await api.post<MapWithPinCount>('/maps', { name, type })
      setMaps([newMap, ...maps])
      setIsCreateModalOpen(false)
      toast.success('Map created!')
      navigate(`/map/${newMap.id}`)
    } catch (err) {
      toast.error('Failed to create map')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-pulse text-primary-500">Loading maps...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-800">Your Maps</h1>
              <p className="text-sm text-neutral-500">Hi, {user?.displayName}</p>
            </div>
          </div>

          <Button onClick={() => setIsCreateModalOpen(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Map
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {maps.length === 0 ? (
          <NoMapsEmptyState onCreateMap={() => setIsCreateModalOpen(true)} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {maps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                onClick={() => navigate(`/map/${map.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Map Modal */}
      <CreateMapModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateMap}
      />
    </div>
  )
}

interface MapCardProps {
  map: MapWithPinCount
  onClick: () => void
}

function MapCard({ map, onClick }: MapCardProps) {
  const typeLabels = {
    shared: 'Shared Map',
    solo_trip: 'Solo Trip',
    memory_collection: 'Memory Collection',
  }

  return (
    <Card hoverable onClick={onClick} padding="none" className="overflow-hidden">
      {/* Cover image or gradient */}
      <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-200 relative">
        {map.coverPath && (
          <img
            src={map.coverPath}
            alt={map.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-medium text-neutral-600 px-2 py-1 rounded-full">
            {typeLabels[map.type]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <CardTitle>{map.name}</CardTitle>
        {map.description && (
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
            {map.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-neutral-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {map.pinCount} pins
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {new Date(map.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  )
}

interface CreateMapModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, type: 'shared' | 'solo_trip') => void
}

function CreateMapModal({ isOpen, onClose, onCreate }: CreateMapModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'shared' | 'solo_trip'>('shared')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    await onCreate(name, type)
    setIsCreating(false)
    setName('')
    setType('shared')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Map">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Map Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Our Adventures"
          required
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Map Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('shared')}
              className={`p-4 rounded-xl border-2 text-left transition-colors ${
                type === 'shared'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="font-medium text-neutral-800">Shared</div>
              <div className="text-sm text-neutral-500">Both can edit</div>
            </button>
            <button
              type="button"
              onClick={() => setType('solo_trip')}
              className={`p-4 rounded-xl border-2 text-left transition-colors ${
                type === 'solo_trip'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="font-medium text-neutral-800">Solo Trip</div>
              <div className="text-sm text-neutral-500">Only you can edit</div>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isCreating} disabled={!name.trim()}>
            Create Map
          </Button>
        </div>
      </form>
    </Modal>
  )
}
