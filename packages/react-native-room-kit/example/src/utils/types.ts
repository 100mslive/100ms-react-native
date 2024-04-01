import { Platform } from 'react-native';

export enum Theme {
  LIGHT = 'Light',
  DARK = 'Dark',
}

export const Constants = {
  MEET_URL: 'MEET_URL',
  STATIC_USERID: `rn-${Platform.OS}-static-userid`,
  NAME: 'NAME',
} as const;
