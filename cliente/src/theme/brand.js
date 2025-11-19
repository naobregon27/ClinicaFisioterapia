export const brandPalette = {
  primary: '#0d4d61',
  primaryDark: '#0b3c4d',
  primaryLight: '#6fb0b8',
  accent: '#88c9cf',
  neutral: '#f4fafb',
  text: '#102731',
};

export const brandGradients = {
  hero: `linear-gradient(145deg, ${brandPalette.primaryLight} 0%, ${brandPalette.primary} 55%, ${brandPalette.primaryDark} 100%)`,
  primary: `linear-gradient(135deg, ${brandPalette.primaryDark} 0%, ${brandPalette.primaryLight} 100%)`,
  primaryInverse: `linear-gradient(135deg, ${brandPalette.primaryLight} 0%, ${brandPalette.primaryDark} 100%)`,
};

export const brandAlpha = (alpha) => `rgba(13, 77, 97, ${alpha})`;

export const brandShadows = {
  card: '0 20px 40px rgba(7,37,47,0.12)',
  button: '0 10px 20px rgba(7,37,47,0.25)',
  buttonHover: '0 14px 26px rgba(7,37,47,0.35)',
};

