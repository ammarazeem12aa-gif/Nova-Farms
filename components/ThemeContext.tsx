
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, FarmSettings } from '../types';
import { storage } from '../services/storage';

interface ThemeColors {
  primary: string; // e.g. 'amber', 'fuchsia'
  primaryRing: string;
  bgPage: string;
  bgCard: string;
  textMain: string;
  textMuted: string;
  border: string;
}

interface ThemeContextType {
  settings: FarmSettings;
  updateSettings: (s: Partial<FarmSettings>) => void;
  colors: ThemeColors;
  isDark: boolean;
  themeClasses: {
    buttonPrimary: string;
    buttonSecondary: string;
    input: string;
    card: string;
    textHighlight: string;
    subtleBg: string;
    hoverBg: string;
    divider: string;
    tableHeader: string;
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FarmSettings>(storage.getSettings());

  const updateSettings = (updates: Partial<FarmSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    storage.setSettings(newSettings);
  };

  const getColors = (theme: Theme): ThemeColors => {
    switch (theme) {
      case 'DARK':
        return {
          primary: 'blue',
          primaryRing: 'focus:ring-blue-500',
          bgPage: 'bg-slate-950',
          bgCard: 'bg-slate-900',
          textMain: 'text-slate-200',
          textMuted: 'text-slate-400',
          border: 'border-slate-800',
        };
      case 'FUN':
        return {
          primary: 'fuchsia',
          primaryRing: 'focus:ring-fuchsia-500',
          bgPage: 'bg-purple-50',
          bgCard: 'bg-white',
          textMain: 'text-gray-900',
          textMuted: 'text-gray-500',
          border: 'border-purple-200',
        };
      case 'LIGHT':
      default:
        return {
          primary: 'amber',
          primaryRing: 'focus:ring-amber-500',
          bgPage: 'bg-gray-50',
          bgCard: 'bg-white',
          textMain: 'text-gray-900',
          textMuted: 'text-gray-500',
          border: 'border-gray-200',
        };
    }
  };

  const colors = getColors(settings.theme);
  const isDark = settings.theme === 'DARK';

  // Computed Tailwind utility strings for common components
  const themeClasses = {
    buttonPrimary: settings.theme === 'FUN' 
      ? `bg-fuchsia-500 hover:bg-fuchsia-600 text-white ${colors.primaryRing}`
      : settings.theme === 'DARK'
      ? `bg-blue-600 hover:bg-blue-700 text-white ${colors.primaryRing}`
      : `bg-amber-500 hover:bg-amber-600 text-white ${colors.primaryRing}`,
      
    buttonSecondary: settings.theme === 'DARK'
      ? `bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700 ${colors.primaryRing}`
      : `bg-white border-gray-300 text-gray-700 hover:bg-gray-50 ${colors.primaryRing}`,
      
    input: settings.theme === 'DARK'
      ? `bg-slate-950 border-slate-700 text-gray-200 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500`
      : `bg-white border-gray-300 text-gray-900 focus:border-${colors.primary}-500 focus:ring-${colors.primary}-500`,
      
    card: `${colors.bgCard} ${colors.border} ${colors.textMain}`,
    
    textHighlight: settings.theme === 'FUN' 
      ? 'text-fuchsia-600'
      : settings.theme === 'DARK'
      ? 'text-blue-400'
      : 'text-amber-600',

    // New utility classes for tables and lists
    subtleBg: isDark ? 'bg-slate-800/50' : 'bg-gray-50',
    hoverBg: isDark ? 'hover:bg-slate-800/80' : 'hover:bg-gray-50',
    divider: isDark ? 'divide-slate-800' : 'divide-gray-100',
    tableHeader: isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, colors, isDark, themeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
