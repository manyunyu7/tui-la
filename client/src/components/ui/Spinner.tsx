import { cn } from '@/utils/cn'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        sizeStyles[size],
        className
      )}
    >
      {/* Pulsing heart animation */}
      <div className="absolute animate-ping">
        <HeartIcon className={cn('text-primary-300', sizeStyles[size])} />
      </div>
      <HeartIcon className={cn('text-primary-500 animate-pulse', sizeStyles[size])} />
    </div>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

export interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Spinner size="lg" />
      <p className="mt-4 text-neutral-600 font-medium">{message}</p>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden animate-pulse">
      <div className="h-32 bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="flex gap-4">
          <div className="h-4 bg-neutral-200 rounded w-16" />
          <div className="h-4 bg-neutral-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl animate-pulse">
          <div className="w-10 h-10 bg-neutral-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-1/3" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-4 text-neutral-600">{message}</p>
    </div>
  )
}

export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-neutral-500">
      <Spinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
