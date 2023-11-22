import { StyleSheet } from 'react-native';
import { Theme_ThemeType } from '@100mslive/types-prebuilt';
import type {
  ColorPalette,
  Theme,
  Typography,
} from '@100mslive/types-prebuilt';

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

export const STATIC_COLOR_PALETTE: ColorPalette = {
  primary_default: '#2572ED',
  primary_bright: '#538DFF',
  primary_dim: '#002D6D',
  primary_disabled: '#004299',

  on_primary_high: '#FFFFFF',
  on_primary_medium: '#CCDAFF',
  on_primary_low: '#84AAFF',

  secondary_default: '#444954',
  secondary_bright: '#70778B',
  secondary_dim: '#293042',
  secondary_disabled: '#404759',

  on_secondary_high: '#ffffff',
  on_secondary_medium: '#D3D9F0',
  on_secondary_low: '#A4ABC0',

  background_default: '#0B0E15',
  background_dim: '#000000',

  surface_default: '#191B23',
  surface_bright: '#272A31',
  surface_brighter: '#2E3038',
  surface_dim: '#11131A',

  on_surface_high: '#EFF0FA',
  on_surface_medium: '#C5C6D0',
  on_surface_low: '#8F9099',

  border_default: '#1D1F27',
  border_bright: '#272A31',
  // border_primary: '#2471ED',

  alert_success: '#36B37E',
  alert_warning: '#FFAB00',
  alert_error_default: '#C74E5B',
  alert_error_bright: '#FFB2B6',
  alert_error_brighter: '#FFEDEC',
  alert_error_dim: '#270005',
};

export const COLORS = {
  PRIMARY: {
    LIGHT: '#66A1FF',
    DEFAULT: '#2572ED',
    DARK: '#143466',
    DISABLED: '#004299',
    ON_PRIMARY: {
      LOW: '#84AAFF',
    },
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
  LOADING_BACKDROP: 'rgba(0, 0, 0, 0.7)',
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
      MEDIUM: '#C5C6D0',
      HIGH: '#EFF0FA',
    },
  },
  BACKGROUND: {
    DIM: '#000000',
    DIM_80: 'rgba(0, 0, 0, 0.80)',
    DIM_64: 'rgba(0, 0, 0, 0.64)',
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

export function hexToRgbA(hex: string, alpha: number = 1) {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  let c: any = hex.substring(1).split('');
  if (c.length == 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');

  return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(
    ', '
  )}, ${alpha})`;
}

export const DEFAULT_TYPOGRAPHY: Required<Typography> = {
  font_family: 'Inter',
};

export const DEFAULT_THEME: Required<Theme> = {
  default: true,
  name: 'static',
  theme_type: Theme_ThemeType.THEME_TYPE_DARK,
  palette: STATIC_COLOR_PALETTE,
};
