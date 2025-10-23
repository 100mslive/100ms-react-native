import { UIManager } from 'react-native';
import type {
  StyleProp,
  NativeSyntheticEvent,
  ViewStyle,
  NativeMethods,
} from 'react-native';
import type {
  HMSHLSPlayerCuesEvent,
  HMSHLSPlayerPlaybackEvent,
  HMSHLSPlayerStatsEvent,
  RequestedDataEvent,
} from '../../types';
import NativeHMSHLSPlayer from '../../specs/NativeHMSHLSPlayer';

export type HmsHlsPlaybackEventHandler = (
  event: NativeSyntheticEvent<HMSHLSPlayerPlaybackEvent>
) => void;

export type HmsHlsStatsEventHandler = (
  event: NativeSyntheticEvent<HMSHLSPlayerStatsEvent>
) => void;

export type HlsSPlayerCuesEventHandler = (
  event: NativeSyntheticEvent<HMSHLSPlayerCuesEvent>
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
  onHlsPlayerCuesEvent?: HlsSPlayerCuesEventHandler;
};

// Use the Fabric-compatible native component from the spec file
export const RCTHMSHLSPlayer = NativeHMSHLSPlayer;

export type RCTHMSHLSPlayerRef = React.Component<RCTHMSHLSPlayerProps> &
  Readonly<NativeMethods>;

export const RCTHMSHLSPlayerViewManagerConfig =
  UIManager.getViewManagerConfig('HMSHLSPlayer');
