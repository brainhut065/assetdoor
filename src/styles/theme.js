// Theme configuration matching Flutter app (yellow/white minimalist)
export const theme = {
  colors: {
    // Yellow shades
    yellowPrimary: '#FFD700',      // Gold yellow
    yellowBright: '#FFEB3B',       // Bright yellow
    yellowLight: '#FFF59D',        // Light yellow
    yellowDark: '#FFC107',         // Darker yellow
    yellowAccent: '#FFF176',        // Accent yellow
    
    // White shades
    white: '#FFFFFF',
    whiteOff: '#FAFAFA',
    whiteWarm: '#FFFEF7',
    
    // Text colors
    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textLight: '#8A8A8A',
    textOnYellow: '#1A1A1A',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#FFFEF7',
    
    // Border colors
    border: '#E0E0E0',
    borderLight: '#F5F5F5',
    
    // Status colors
    success: '#4CAF50',
    error: '#E53935',
    warning: '#FF9800',
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

