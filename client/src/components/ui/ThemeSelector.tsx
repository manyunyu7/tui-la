import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Modal, Button } from '@/components/ui'
import { THEMES } from '@/config/constants'
import { cn } from '@/utils/cn'

type ThemeName = keyof typeof THEMES

interface ThemeSelectorProps {
  isOpen: boolean
  onClose: () => void
}

export function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const { currentTheme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(currentTheme)

  const handleSave = () => {
    setTheme(selectedTheme)
    onClose()
  }

  const themeEntries = Object.entries(THEMES) as [ThemeName, typeof THEMES[ThemeName]][]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Theme" size="lg">
      <div className="space-y-4">
        <p className="text-neutral-600 text-sm">
          Pick a theme that matches your vibe together
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themeEntries.map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setSelectedTheme(key)}
              className={cn(
                'p-4 rounded-xl border-2 transition-all text-left',
                selectedTheme === key
                  ? 'border-neutral-800 shadow-md scale-105'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              {/* Theme preview */}
              <div className="flex gap-1 mb-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: theme.secondary }}
                />
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
              </div>

              <div className="font-medium text-neutral-800">{theme.name}</div>

              {/* Background preview */}
              <div
                className="mt-2 h-6 rounded-md border border-neutral-200"
                style={{ backgroundColor: theme.background }}
              />
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply Theme
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface ThemeButtonProps {
  onClick: () => void
}

export function ThemeButton({ onClick }: ThemeButtonProps) {
  const { colors } = useTheme()

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
      title="Change theme"
    >
      <div className="flex -space-x-1">
        <div
          className="w-4 h-4 rounded-full border-2 border-white"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="w-4 h-4 rounded-full border-2 border-white"
          style={{ backgroundColor: colors.secondary }}
        />
      </div>
      <span className="text-sm text-neutral-600">Theme</span>
    </button>
  )
}
