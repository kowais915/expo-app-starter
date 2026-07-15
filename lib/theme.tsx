import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'app_theme';

/**
 * Brand accent — the single knob to recolor the whole app. Change this one value
 * to rebrand; the tinted surfaces below derive from it automatically.
 */
export const ACCENT = '#6366F1';

/** Same color at a given opacity — used for accent-tinted surfaces/glows. */
export function withAlpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export interface ThemeColors {
  BG: string;
  CARD_BG: string;
  BORDER: string;
  TEXT_PRIMARY: string;
  TEXT_SECONDARY: string;
  TEXT_MUTED: string;
  INACTIVE: string;
  TAB_BAR_BG: string;
  TAB_BORDER: string;
  ACCENT: string;
  AVATAR_BG: string;
  INPUT_BG: string;
  INPUT_FOCUS_BG: string;
  HANDLE: string;
}

const DARK: ThemeColors = {
  BG: '#0C0C0C',
  CARD_BG: '#161616',
  BORDER: '#252525',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#888888',
  TEXT_MUTED: '#555555',
  INACTIVE: '#444444',
  TAB_BAR_BG: '#111111',
  TAB_BORDER: '#1E1E1E',
  ACCENT,
  AVATAR_BG: withAlpha(ACCENT, 0.16),
  INPUT_BG: '#161616',
  INPUT_FOCUS_BG: withAlpha(ACCENT, 0.09),
  HANDLE: '#444444',
};

const LIGHT: ThemeColors = {
  BG: '#F5F5F5',
  CARD_BG: '#FFFFFF',
  BORDER: '#E5E5E5',
  TEXT_PRIMARY: '#111111',
  TEXT_SECONDARY: '#666666',
  TEXT_MUTED: '#999999',
  INACTIVE: '#AAAAAA',
  TAB_BAR_BG: '#FFFFFF',
  TAB_BORDER: '#E5E5E5',
  ACCENT,
  AVATAR_BG: withAlpha(ACCENT, 0.12),
  INPUT_BG: '#FFFFFF',
  INPUT_FOCUS_BG: withAlpha(ACCENT, 0.06),
  HANDLE: '#CCCCCC',
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: LIGHT,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY).then((val) => {
      if (val === 'dark') setIsDark(true);
      else if (val === 'light') setIsDark(false);
      // no stored value → keep default (light)
    });
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    SecureStore.setItemAsync(THEME_KEY, next ? 'dark' : 'light');
  }

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? DARK : LIGHT, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
