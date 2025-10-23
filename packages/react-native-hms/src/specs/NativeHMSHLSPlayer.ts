/**
 * This is a Fabric component spec for HMSHLSPlayer
 * It defines the props interface for the native HLS player view component
 */

import type { ViewProps, HostComponent } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  /**
   * HLS stream URL to play
   */
  url?: string;

  /**
   * Enable playback statistics overlay
   */
  enableStats?: boolean;

  /**
   * Show playback controls
   */
  enableControls?: boolean;
}

export default codegenNativeComponent<NativeProps>(
  'HMSHLSPlayer'
) as HostComponent<NativeProps>;
