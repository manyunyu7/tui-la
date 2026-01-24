import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: () => void
  description: string
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    for (const shortcut of shortcuts) {
      const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
      const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey
      const altMatches = shortcut.alt ? e.altKey : !e.altKey

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        e.preventDefault()
        shortcut.handler()
        return
      }
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Predefined shortcut configs for the map page
export const MAP_SHORTCUTS = {
  TOGGLE_DRAWING: { key: 'd', description: 'Toggle drawing mode' },
  TOGGLE_TIMELINE: { key: 't', description: 'Toggle timeline' },
  TOGGLE_FILTERS: { key: 'f', description: 'Toggle filters' },
  FIT_BOUNDS: { key: 'b', description: 'Fit map to all pins' },
  ZOOM_IN: { key: '+', description: 'Zoom in' },
  ZOOM_OUT: { key: '-', description: 'Zoom out' },
  ESCAPE: { key: 'Escape', description: 'Close modal/panel' },
  SEARCH: { key: '/', description: 'Focus search' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo last stroke' },
  REDO: { key: 'y', ctrl: true, description: 'Redo last stroke' },
} as const

// Shortcut display helper
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []
  if (shortcut.ctrl || shortcut.meta) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  parts.push(shortcut.key.toUpperCase())
  return parts.join(' + ')
}
