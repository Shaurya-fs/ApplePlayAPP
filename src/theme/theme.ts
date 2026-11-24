export const colors = {
  background: '#0B1220',
  surface: '#131C2E',
  surfaceRaised: '#1B2740',
  border: '#24324D',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  accent: '#2DD4BF',
  accentSoft: 'rgba(45, 212, 191, 0.16)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  black: '#000000',
  scrim: 'rgba(11, 18, 32, 0.78)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const type = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 22, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, lineHeight: 22, color: colors.textMuted },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 1,
    color: colors.textMuted,
  },
} as const;
