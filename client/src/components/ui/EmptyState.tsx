import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Button, type ButtonProps } from './Button'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: ButtonProps['variant']
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-6 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-neutral-300">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-bold text-neutral-800 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-neutral-500 mb-6 max-w-sm">
          {description}
        </p>
      )}

      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Pre-made empty states
export function NoMapsEmptyState({ onCreateMap }: { onCreateMap: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      }
      title="No maps yet"
      description="Create your first map to start saving memories together"
      action={{
        label: 'Create Map',
        onClick: onCreateMap,
      }}
    />
  )
}

export function NoPinsEmptyState({ onAddPin }: { onAddPin?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      }
      title="No pins on this map"
      description="Tap anywhere on the map to add your first memory pin"
      action={onAddPin ? {
        label: 'Add Pin',
        onClick: onAddPin,
      } : undefined}
    />
  )
}

export function WaitingForPartnerEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
      title="Waiting for your partner"
      description="Share your invite code with your partner to start using Twy together"
    />
  )
}
