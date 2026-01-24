import { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholderClassName?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  placeholderClassName,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = imgRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/skeleton */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-neutral-200 animate-pulse',
            placeholderClassName
          )}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  )
}

interface LazyImageGalleryProps {
  images: Array<{
    src: string
    thumbnailSrc?: string
    alt?: string
  }>
  onImageClick?: (index: number) => void
  className?: string
  imageClassName?: string
}

export function LazyImageGallery({
  images,
  onImageClick,
  className,
  imageClassName,
}: LazyImageGalleryProps) {
  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <div
        className={cn('cursor-pointer', className)}
        onClick={() => onImageClick?.(0)}
      >
        <LazyImage
          src={images[0].thumbnailSrc || images[0].src}
          alt={images[0].alt || ''}
          className={cn('w-full h-48 rounded-lg', imageClassName)}
        />
      </div>
    )
  }

  if (images.length === 2) {
    return (
      <div className={cn('grid grid-cols-2 gap-1', className)}>
        {images.map((img, i) => (
          <div
            key={i}
            className="cursor-pointer"
            onClick={() => onImageClick?.(i)}
          >
            <LazyImage
              src={img.thumbnailSrc || img.src}
              alt={img.alt || ''}
              className={cn('w-full h-32 rounded-lg', imageClassName)}
            />
          </div>
        ))}
      </div>
    )
  }

  // 3+ images: show first large, rest in grid
  return (
    <div className={cn('space-y-1', className)}>
      <div
        className="cursor-pointer"
        onClick={() => onImageClick?.(0)}
      >
        <LazyImage
          src={images[0].thumbnailSrc || images[0].src}
          alt={images[0].alt || ''}
          className={cn('w-full h-40 rounded-lg', imageClassName)}
        />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {images.slice(1, 4).map((img, i) => (
          <div
            key={i + 1}
            className="relative cursor-pointer"
            onClick={() => onImageClick?.(i + 1)}
          >
            <LazyImage
              src={img.thumbnailSrc || img.src}
              alt={img.alt || ''}
              className={cn('w-full h-20 rounded-lg', imageClassName)}
            />
            {i === 2 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
