export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Twy'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const THEMES = {
  rose_garden: {
    name: 'Rose Garden',
    primary: '#E11D48',
    secondary: '#FB7185',
    accent: '#831843',
    background: '#FFF1F2',
  },
  sunset_love: {
    name: 'Sunset Love',
    primary: '#EA580C',
    secondary: '#FB923C',
    accent: '#9A3412',
    background: '#FFF7ED',
  },
  midnight_romance: {
    name: 'Midnight Romance',
    primary: '#7C3AED',
    secondary: '#A78BFA',
    accent: '#4C1D95',
    background: '#F5F3FF',
  },
  cherry_blossom: {
    name: 'Cherry Blossom',
    primary: '#EC4899',
    secondary: '#F9A8D4',
    accent: '#9D174D',
    background: '#FDF2F8',
  },
  lavender_dreams: {
    name: 'Lavender Dreams',
    primary: '#8B5CF6',
    secondary: '#C4B5FD',
    accent: '#6D28D9',
    background: '#FAF5FF',
  },
} as const

export const PIN_TYPES = {
  memory: { label: 'Memory', icon: '💝', color: '#E11D48' },
  wishlist: { label: 'Wishlist', icon: '⭐', color: '#F59E0B' },
  milestone: { label: 'Milestone', icon: '🏆', color: '#22C55E' },
  trip: { label: 'Trip', icon: '✈️', color: '#3B82F6' },
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
