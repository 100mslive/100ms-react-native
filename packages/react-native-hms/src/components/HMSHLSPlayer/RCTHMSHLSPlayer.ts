import { requireNativeComponent, UIManager } from 'react-native';
import type {
  StyleProp,
  NativeSyntheticEvent,
  ViewStyle,
  NativeMethods,
} from 'react-native';
import type {
  HMSHLSPlayerPlaybackEvent,
  HMSHLSPlayerStatsEvent,
  RequestedDataEvent,
} from '../../types';

export type HmsHlsPlaybackEventHandler = (
  event: NativeSyntheticEvent<HMSHLSPlayerPlaybackEvent>
) => void;

export type HmsHlsStatsEventHandler = (
  event: NativeSyntheticEvent<HMSHLSPlayerStatsEvent>
) => void;

export type RequestedDataEventHandler = (
  event: NativeSyntheticEvent<RequestedDataEvent>
) => void;

export type RCTHMSHLSPlayerProps = {
  url?: string;
  style?: StyleProp<ViewStyle>;
  enableStats?: boolean;
  enableControls?: boolean;
  onHmsHlsPlaybackEvent?: HmsHlsPlaybackEventHandler;
  onHmsHlsStatsEvent?: HmsHlsStatsEventHandler;
  onDataReturned?: RequestedDataEventHandler;
};

export const RCTHMSHLSPlayer =
  requireNativeComponent<RCTHMSHLSPlayerProps>('HMSHLSPlayer');

export type RCTHMSHLSPlayerRef = React.Component<RCTHMSHLSPlayerProps> &
  Readonly<NativeMethods>;

export const RCTHMSHLSPlayerViewManagerConfig =
  UIManager.getViewManagerConfig('HMSHLSPlayer');
