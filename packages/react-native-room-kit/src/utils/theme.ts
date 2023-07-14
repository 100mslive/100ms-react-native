import { StyleSheet } from 'react-native';
import { Theme } from './types';

export const FONTS = StyleSheet.create({
  H1: {
    fontSize: 72,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontStyle: 'normal',
    letterSpacing: -1.5,
  },
  H2: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontStyle: 'normal',
    letterSpacing: -0.5,
  },
  H3: {
    fontSize: 40,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontStyle: 'normal',
    letterSpacing: 0.15,
  },
  H4: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontStyle: 'normal',
    letterSpacing: 0.25,
  },
  H5: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontStyle: 'normal',
  },
  H6: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    fontStyle: 'normal',
    letterSpacing: 0.15,
  },
});

var APP_THEME: Theme = Theme.LIGHT;
export const getAppTheme = () => APP_THEME;
export const setAppTheme = (theme: Theme) => (APP_THEME = theme);

export const COLORS = {
  PRIMARY: {
    LIGHT: '#66A1FF',
    DEFAULT: '#2572ED',
    DARK: '#143466',
    DISABLED: '#3666B2',
  },
  SECONDARY: {
    DIM: '#293042',
    LIGHT: '#6B7D99',
    DEFAULT: '#475366',
    DARK: '#2D3440',
    DISABLED: '#242A33',
  },
  BORDER: {
    LIGHT: '#2D3440',
    BRIGHT: '#272A31',
    DEFAULT: '#1D1F27',
    ACCENT: '#2471ED',
  },
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  OVERLAY: 'rgba(34, 34, 34, 0.3)',
  TEXT: {
    HIGH_EMPHASIS: 'rgba(245, 249, 255, 0.95)', // '#F5F9FF'
    MEDIUM_EMPHASIS: 'rgba(224, 236, 255, 0.80)', // '#E0ECFF'
    DISABLED: 'rgba(195, 208, 229, 0.50)', // '#C3D0E5'
    HIGH_EMPHASIS_ACCENT: 'rgba(255, 255, 255, 0.98)', // '#FFFFFF'
    MEDIUM_EMPHASIS_ACCENT: 'rgba(255, 255, 255, 0.72)', // '#FFFFFF'
    DISABLED_ACCENT: 'rgba(255, 255, 255, 0.48)', // '#FFFFFF'
  },
  SURFACE: {
    BRIGHT: '#272A31',
    DIM: '#11131A',
    DEFAULT: '#191B23',
    LIGHT: '#1D2229',
    LIGHTER: '#272E38',
    ON_SURFACE: {
      LOW: '#8F9099',
      HIGH: '#EFF0FA',
    },
  },
  BACKGROUND: {
    DIM: '#000000',
    DIM_80: 'rgba(0, 0, 0, 0.8)',
    DEFAULT: '#0B0E15',
    DARK: '#090B0D',
    DARKER: '#040405',
    ERROR: '#B24751',
  },
  INDICATORS: {
    WARNING: '#FFAB00',
    ERROR: '#CC525F',
    SUCCESS: '#36B37E',
  },
  TWIN: {
    RED: '#fa1919',
    YELLOW: '#FAC919',
    GREEN: '#00AE63',
    PURPLE: '#6554C0',
    ORANGE: '#F69133',
    CYAN: '#8FF5FB',
  },
  BASE: {
    BLACK: '#000000',
    WHITE: '#FFFFFF',
  },
  EXTENDED: {
    PURPLE: '#7E47EB',
  },
  ALERT: {
    ERROR: {
      DIM: '#270005',
      DEFAULT: '#C74E5B',
      BRIGHT: '#FFB2B6',
      BRIGHTER: '#FFEDEC',
    },
  },
};
