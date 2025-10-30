import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Theme = 'midnight' | 'ocean' | 'forest' | 'sunset' | 'royal'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const themes = {
  midnight: {
    name: 'Midnight Blue',
    colors: {
      background: 'linear-gradient(to bottom right, #02010F, #0a0a1f)',
      primary: '217 91% 60%',
      primaryForeground: '222.2 47.4% 11.2%',
    }
  },
  ocean: {
    name: 'Ocean Breeze',
    colors: {
      background: 'linear-gradient(to bottom right, #0f172a, #1e3a5f)',
      primary: '199 89% 48%',
      primaryForeground: '210 40% 98%',
    }
  },
  forest: {
    name: 'Forest Night',
    colors: {
      background: 'linear-gradient(to bottom right, #0a1810, #1a3a2e)',
      primary: '142 76% 36%',
      primaryForeground: '144 61% 98%',
    }
  },
  sunset: {
    name: 'Sunset Glow',
    colors: {
      background: 'linear-gradient(to bottom right, #1a0a0f, #3a1a2e)',
      primary: '346 77% 50%',
      primaryForeground: '355 100% 97%',
    }
  },
  royal: {
    name: 'Royal Purple',
    colors: {
      background: 'linear-gradient(to bottom right, #120a1f, #2a1a3a)',
      primary: '271 91% 65%',
      primaryForeground: '210 40% 98%',
    }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme')
    return (stored as Theme) || 'midnight'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    
    const root = document.documentElement
    const themeColors = themes[theme].colors
    
    // Add dark class to root for Tailwind dark mode
    root.classList.add('dark')
    
    // Apply background
    document.body.style.background = themeColors.background
    
    // Apply CSS variables
    root.style.setProperty('--primary', themeColors.primary)
    root.style.setProperty('--primary-foreground', themeColors.primaryForeground)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

