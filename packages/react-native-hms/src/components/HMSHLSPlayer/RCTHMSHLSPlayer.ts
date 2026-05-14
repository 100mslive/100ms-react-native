import type { ElementRef } from 'react';
import type { StyleProp, NativeSyntheticEvent, ViewStyle } from 'react-native';
import HMSHLSPlayerNativeComponent, {
  Commands,
} from '../../specs/HMSHLSPlayerNativeComponent';
import type {
  HMSHLSPlayerCuesEvent,
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

export const RCTHMSHLSPlayer = HMSHLSPlayerNativeComponent;

export const RCTHMSHLSPlayerCommands = Commands;

export type RCTHMSHLSPlayerRef = ElementRef<typeof RCTHMSHLSPlayer>;
