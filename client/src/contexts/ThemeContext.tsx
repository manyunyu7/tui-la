import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { THEMES, type ThemeColors } from '@/config/constants'

type ThemeName = keyof typeof THEMES

interface CustomThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
}

interface ThemeContextType {
  currentTheme: ThemeName
  colors: ThemeColors
  setTheme: (theme: ThemeName) => void
  setCustomColors: (colors: CustomThemeColors) => void
  customColors: CustomThemeColors
  themes: typeof THEMES
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
  primary: '#E11D48',
  secondary: '#FB7185',
  accent: '#831843',
  background: '#FFF1F2',
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('rose_garden')
  const [customColors, setCustomColorsState] = useState<CustomThemeColors>(DEFAULT_CUSTOM_COLORS)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName | null
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme)
    }

    // Load custom colors
    const savedCustomColors = localStorage.getItem('customThemeColors')
    if (savedCustomColors) {
      try {
        const parsed = JSON.parse(savedCustomColors) as CustomThemeColors
        setCustomColorsState(parsed)
      } catch {
        // Ignore invalid JSON
      }
    }
  }, [])

  // Apply theme CSS variables
  useEffect(() => {
    const theme = currentTheme === 'custom'
      ? { ...customColors, name: 'Custom' }
      : THEMES[currentTheme]
    const root = document.documentElement

    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-secondary', theme.secondary)
    root.style.setProperty('--color-accent', theme.accent)
    root.style.setProperty('--color-background', theme.background)

    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', theme.primary)
    }
  }, [currentTheme, customColors])

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme)
    localStorage.setItem('theme', theme)
  }

  const setCustomColors = (colors: CustomThemeColors) => {
    setCustomColorsState(colors)
    localStorage.setItem('customThemeColors', JSON.stringify(colors))
  }

  const colors: ThemeColors = currentTheme === 'custom'
    ? { ...customColors, name: 'Custom' }
    : THEMES[currentTheme]

  return (
    <ThemeContext.Provider value={{ currentTheme, colors, setTheme, setCustomColors, customColors, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
