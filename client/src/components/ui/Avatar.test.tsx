import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarGroup } from './Avatar'

describe('Avatar', () => {
  it('renders initials when no image provided', () => {
    render(<Avatar name="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders single initial for single name', () => {
    render(<Avatar name="John" />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders ? when no name provided', () => {
    render(<Avatar />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders image when src provided', () => {
    render(<Avatar src="/avatar.jpg" name="John" alt="User avatar" />)
    const img = screen.getByAltText('User avatar')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/avatar.jpg')
  })

  it('shows online indicator when online is true', () => {
    const { container } = render(<Avatar name="John" online={true} />)
    const indicator = container.querySelector('.bg-success-500')
    expect(indicator).toBeTruthy()
  })

  it('shows offline indicator when online is false', () => {
    const { container } = render(<Avatar name="John" online={false} />)
    const indicator = container.querySelector('.bg-neutral-300')
    expect(indicator).toBeTruthy()
  })

  it('applies size classes', () => {
    const { container: smContainer } = render(<Avatar name="J" size="sm" />)
    expect(smContainer.querySelector('.w-8')).toBeTruthy()

    const { container: lgContainer } = render(<Avatar name="J" size="lg" />)
    expect(lgContainer.querySelector('.w-14')).toBeTruthy()
  })
})

describe('AvatarGroup', () => {
  it('renders multiple avatars', () => {
    render(
      <AvatarGroup
        avatars={[
          { name: 'Alice' },
          { name: 'Bob' },
        ]}
      />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('shows overflow count when exceeding max', () => {
    render(
      <AvatarGroup
        avatars={[
          { name: 'Alice' },
          { name: 'Bob' },
          { name: 'Charlie' },
          { name: 'Dave' },
          { name: 'Eve' },
        ]}
        max={3}
      />
    )
    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})
