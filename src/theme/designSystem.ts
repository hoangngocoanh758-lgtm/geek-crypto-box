export type Theme = {
  id: string;
  name: string;
  bgGradient: string;
  bgImage?: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDanger?: string; // Added for error states
  statusSuccess: string;
  statusError: string;
  statusWarning: string;
};

export const THEMES: Record<string, Theme> = {
  deep_indigo: {
    id: 'deep_indigo',
    name: '极客深蓝',
    // Cold, deep background. Indigo hints at the bottom right.
    bgGradient: 'bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#1e1b4b]', 
    bgImage: undefined, // Removed external image for strict control
    // High opacity, dark card background for better contrast
    cardBg: 'bg-[#1e293b] shadow-2xl', 
    cardBorder: 'border-slate-700',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    // Global Primary Color: Indigo
    accent: 'text-indigo-400',
    accentHover: 'hover:bg-indigo-500/10',
    // Primary Button: Indigo (Solid, High Contrast)
    buttonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50',
    // Secondary Button: Slate (Subtle)
    buttonSecondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600',
    // Error Button (Red is only for error/danger)
    buttonDanger: 'bg-rose-700 hover:bg-rose-600 text-white',
    
    // Status Colors
    statusSuccess: 'text-emerald-400',
    statusError: 'text-rose-400',
    statusWarning: 'text-amber-400',
  }
};

export const getThemeForLevel = (level: number): Theme => {
  void level;
  return THEMES.deep_indigo;
};
