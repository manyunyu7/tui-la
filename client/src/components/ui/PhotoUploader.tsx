import { useState, useRef, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { Button } from './Button'
import { api } from '@/services/api'
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/config/constants'

interface UploadedFile {
  filePath: string
  thumbnailPath: string
  originalName: string
  mimeType: string
  fileSize: number
  width: number
  height: number
}

interface PhotoUploaderProps {
  photos: UploadedFile[]
  onPhotosChange: (photos: UploadedFile[]) => void
  maxPhotos?: number
  className?: string
  onPhotoClick?: (index: number) => void
}

export function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  className,
  onPhotoClick,
}: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxPhotos - photos.length
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    // Validate files
    for (const file of filesToUpload) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('Only JPEG, PNG, GIF, and WebP images are allowed')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be less than 10MB')
        return
      }
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    const uploadedPhotos: UploadedFile[] = []

    for (let i = 0; i < filesToUpload.length; i++) {
      try {
        const file = filesToUpload[i]
        const result = await api.upload<UploadedFile>('/upload', file)
        uploadedPhotos.push(result)
        setUploadProgress(((i + 1) / filesToUpload.length) * 100)
      } catch {
        setError('Failed to upload one or more photos')
      }
    }

    if (uploadedPhotos.length > 0) {
      onPhotosChange([...photos, ...uploadedPhotos])
    }

    setIsUploading(false)
    setUploadProgress(0)
  }, [photos, maxPhotos, onPhotosChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleRemove = useCallback((index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }, [photos, onPhotosChange])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          'border-2 border-dashed rounded-xl p-6',
          'flex flex-col items-center justify-center',
          'transition-colors cursor-pointer',
          isUploading
            ? 'border-primary-300 bg-primary-50'
            : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50'
        )}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {isUploading ? (
          <div className="text-center">
            <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-neutral-500">Uploading...</p>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-neutral-600 text-center">
              Drop photos here or click to browse
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {photos.length}/{maxPhotos} photos
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-error-500">{error}</p>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={photo.filePath} className="relative group aspect-square">
              <img
                src={photo.thumbnailPath || photo.filePath}
                alt={photo.originalName}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onPhotoClick?.(index)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(index)
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
