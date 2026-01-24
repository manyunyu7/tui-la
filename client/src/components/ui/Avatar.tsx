import { cn } from '@/utils/cn'

export interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  online?: boolean
  className?: string
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  online,
  className,
}: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  const onlineIndicatorSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  }

  const getInitials = (name?: string): string => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'flex items-center justify-center',
          'rounded-full overflow-hidden',
          'bg-primary-100 text-primary-600 font-bold',
          'ring-2 ring-white',
          sizeStyles[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0',
            'rounded-full ring-2 ring-white',
            onlineIndicatorSize[size],
            online ? 'bg-success-500' : 'bg-neutral-300'
          )}
        />
      )}
    </div>
  )
}

export interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string }>
  size?: 'sm' | 'md' | 'lg'
  max?: number
  className?: string
}

export function AvatarGroup({
  avatars,
  size = 'md',
  max = 3,
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max)
  const remaining = avatars.length - max

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs -ml-2',
    md: 'w-10 h-10 text-sm -ml-3',
    lg: 'w-14 h-14 text-lg -ml-4',
  }

  return (
    <div className={cn('flex items-center', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className={index > 0 ? sizeStyles[size].split(' ').pop() : ''}
        />
      ))}

      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center',
            'rounded-full',
            'bg-neutral-200 text-neutral-600 font-bold',
            'ring-2 ring-white',
            sizeStyles[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
