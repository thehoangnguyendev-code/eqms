/**
 * Theme Context
 * Provides theme state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as Theme) || defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      let effective: 'light' | 'dark' = 'light';

      if (theme === 'auto') {
        effective = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        effective = theme;
      }

      setResolvedTheme(effective);
      root.setAttribute('data-theme', effective);
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') updateTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
