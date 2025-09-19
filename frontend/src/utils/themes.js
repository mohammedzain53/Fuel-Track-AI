// Theme definitions for Fuel Track AI
export const themes = {
  'modern-finance': {
    name: '💎 Modern Finance',
    description: 'Blue + Purple',
    colors: {
      primary: '#1E3A8A',
      primaryDark: '#1E40AF',
      primaryLight: '#3B82F6',
      secondary: '#5B21B6',
      secondaryLight: '#7C3AED',
      accent: '#06B6D4',
      accentDark: '#0891B2',
      background: '#F3F4F6',
      surface: '#FFFFFF',
      text: '#1E3A8A',
      textSecondary: '#374151'
    }
  }
};

export const applyTheme = (themeName) => {
  const theme = themes[themeName];
  if (!theme) return;

  const root = document.documentElement;
  const colors = theme.colors;

  // Apply CSS custom properties
  root.style.setProperty('--primary-color', colors.primary);
  root.style.setProperty('--primary-dark', colors.primaryDark);
  root.style.setProperty('--primary-light', colors.primaryLight);
  root.style.setProperty('--secondary-color', colors.secondary);
  root.style.setProperty('--secondary-light', colors.secondaryLight);
  root.style.setProperty('--accent-color', colors.accent);
  root.style.setProperty('--accent-dark', colors.accentDark);
  root.style.setProperty('--background-color', colors.background);
  root.style.setProperty('--surface-color', colors.surface);
  root.style.setProperty('--text-color', colors.text);
  root.style.setProperty('--text-secondary', colors.textSecondary);

  // Update gradients
  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`);
  root.style.setProperty('--gradient-secondary', `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`);
  root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`);



  // Save theme preference
  localStorage.setItem('selectedTheme', themeName);
};

export const getCurrentTheme = () => {
  return 'modern-finance';
};