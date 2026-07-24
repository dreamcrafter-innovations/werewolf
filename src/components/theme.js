// src/components/theme.js
export const COLORS = {
  bg: '#0B0B1E',
  surface: '#131328',
  card: '#1A1A32',
  cardBorder: '#2A2A4A',

  primary: '#FF8C00',       // diya orange
  primaryDark: '#CC6A00',
  primaryLight: '#FFB347',

  evil: '#C0392B',          // pisach red
  evilDark: '#7B0000',
  evilGlow: '#FF4444',

  village: '#27AE60',       // village green
  villageDark: '#1A6B3A',

  tantrik: '#9B59B6',       // mystical purple
  vaidya: '#2980B9',        // healer blue
  shikari: '#D4AC0D',       // hunter gold
  mukhiya: '#FF8C00',       // chief orange

  text: '#EEE8F0',
  textSecondary: '#9090B0',
  textDim: '#555575',

  white: '#FFFFFF',
  danger: '#E74C3C',
  success: '#2ECC71',
  warning: '#F39C12',

  moonYellow: '#FFF8DC',
  nightBlue: '#0D1B2A',
};

export const FONTS = {
  title: { fontSize: 36, fontWeight: '800', letterSpacing: 1 },
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  role: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  emoji: { fontSize: 48 },
  emojiLg: { fontSize: 72 },
};

export const SHADOW = {
  evil: {
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  orange: {
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
};
