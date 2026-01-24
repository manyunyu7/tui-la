import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Modal, Button } from '@/components/ui'
import { THEMES } from '@/config/constants'
import { cn } from '@/utils/cn'

type ThemeName = keyof typeof THEMES

interface ThemeSelectorProps {
  isOpen: boolean
  onClose: () => void
}

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-neutral-600 w-24">{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pattern="^#[0-9A-Fa-f]{6}$"
          className="flex-1 px-3 py-2 text-sm font-mono border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  )
}

export function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const { currentTheme, setTheme, customColors, setCustomColors } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(currentTheme)
  const [localCustomColors, setLocalCustomColors] = useState(customColors)

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(currentTheme)
      setLocalCustomColors(customColors)
    }
  }, [isOpen, currentTheme, customColors])

  const handleSave = () => {
    if (selectedTheme === 'custom') {
      setCustomColors(localCustomColors)
    }
    setTheme(selectedTheme)
    onClose()
  }

  // Filter out custom theme for display in grid
  const themeEntries = Object.entries(THEMES).filter(([key]) => key !== 'custom') as [ThemeName, typeof THEMES[ThemeName]][]

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

          {/* Custom theme option */}
          <button
            onClick={() => setSelectedTheme('custom')}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-left',
              selectedTheme === 'custom'
                ? 'border-neutral-800 shadow-md scale-105'
                : 'border-neutral-200 hover:border-neutral-300 border-dashed'
            )}
          >
            {/* Custom theme preview */}
            <div className="flex gap-1 mb-3">
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: localCustomColors.primary }}
              />
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: localCustomColors.secondary }}
              />
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: localCustomColors.accent }}
              />
            </div>

            <div className="font-medium text-neutral-800 flex items-center gap-1">
              <span>Custom</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>

            {/* Background preview */}
            <div
              className="mt-2 h-6 rounded-md border border-neutral-200"
              style={{ backgroundColor: localCustomColors.background }}
            />
          </button>
        </div>

        {/* Custom color picker panel */}
        {selectedTheme === 'custom' && (
          <div className="p-4 bg-neutral-50 rounded-xl space-y-3">
            <h4 className="font-medium text-neutral-800">Customize Colors</h4>
            <ColorPicker
              label="Primary"
              value={localCustomColors.primary}
              onChange={(v) => setLocalCustomColors(prev => ({ ...prev, primary: v }))}
            />
            <ColorPicker
              label="Secondary"
              value={localCustomColors.secondary}
              onChange={(v) => setLocalCustomColors(prev => ({ ...prev, secondary: v }))}
            />
            <ColorPicker
              label="Accent"
              value={localCustomColors.accent}
              onChange={(v) => setLocalCustomColors(prev => ({ ...prev, accent: v }))}
            />
            <ColorPicker
              label="Background"
              value={localCustomColors.background}
              onChange={(v) => setLocalCustomColors(prev => ({ ...prev, background: v }))}
            />
          </div>
        )}

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
