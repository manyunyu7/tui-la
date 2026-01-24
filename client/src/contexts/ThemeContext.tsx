import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { THEMES } from '@/config/constants'

type ThemeName = keyof typeof THEMES

interface ThemeColors {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
}

interface ThemeContextType {
  currentTheme: ThemeName
  colors: ThemeColors
  setTheme: (theme: ThemeName) => void
  themes: typeof THEMES
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('rose_garden')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName | null
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  // Apply theme CSS variables
  useEffect(() => {
    const theme = THEMES[currentTheme]
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
  }, [currentTheme])

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme)
    localStorage.setItem('theme', theme)
  }

  const colors = THEMES[currentTheme]

  return (
    <ThemeContext.Provider value={{ currentTheme, colors, setTheme, themes: THEMES }}>
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
