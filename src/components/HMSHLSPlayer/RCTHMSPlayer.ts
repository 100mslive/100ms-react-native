import {
  requireNativeComponent,
  StyleProp,
  NativeSyntheticEvent,
  ViewStyle,
} from 'react-native';
import type { HMSPlayerPlaybackEvent, HMSPlayerStatsEvent } from '../../types';

export type HmsHlsPlaybackEventHandler = (
  event: NativeSyntheticEvent<HMSPlayerPlaybackEvent>
) => void;

export type HmsHlsStatsEventHandler = (
  event: NativeSyntheticEvent<HMSPlayerStatsEvent>
) => void;

export type RCTHMSPlayerProps = {
  url?: string;
  style?: StyleProp<ViewStyle>;
  enableStats?: boolean;
  enableControls?: boolean;
  onHmsHlsPlaybackEvent?: HmsHlsPlaybackEventHandler;
  onHmsHlsStatsEvent?: HmsHlsStatsEventHandler;
};

export const RCTHMSPlayer =
  requireNativeComponent<RCTHMSPlayerProps>('HMSPlayer');
