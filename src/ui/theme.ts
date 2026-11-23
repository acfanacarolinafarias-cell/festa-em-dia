import { useColorScheme } from 'react-native';

// Paleta "eucalipto": verde profundo como cor de ação, neutros levemente esverdeados.
const light = {
  bg: '#F5F7F5',
  surface: '#FFFFFF',
  sunk: '#E9EEEB',
  line: '#D6DED9',
  text: '#18221E',
  muted: '#5B6A63',
  accent: '#1E6B58',
  accentSoft: '#DCEDE6',
  onAccent: '#FFFFFF',
  blush: '#F3DDD5',
  blushText: '#7A3B2A',
  bad: '#B23B2A',
  badSoft: '#F7E1DC',
  warn: '#9A6500',
  warnSoft: '#F6EBD3',
};
const dark: typeof light = {
  bg: '#101614',
  surface: '#17201D',
  sunk: '#1E2925',
  line: '#2C3A35',
  text: '#E6EEEA',
  muted: '#97A8A0',
  accent: '#5CC2A4',
  accentSoft: '#1D3A31',
  onAccent: '#0B1512',
  blush: '#3A2621',
  blushText: '#F0BBA9',
  bad: '#F08A78',
  badSoft: '#3A1F1A',
  warn: '#E5B45C',
  warnSoft: '#33291A',
};
export type Palette = typeof light;
export const palettes = { light, dark };

export function useColors(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = 10;
