import type { ImageURISource, ImageRequireSource } from 'react-native';
import type { HMSSimulcastLayerSettings } from './HMSSimulcastLayerSettings';
import type { HMSCameraFacing } from './HMSCameraFacing';
import type { HMSTrackSettingsInitState } from './HMSTrackSettingsInitState';

export declare class HMSVirtualBackgroundPlugin {
  static NAME: string;
  constructor();
  enable(): Promise<boolean>;
  disable(): Promise<boolean>;
  setBlur(blurRadius: number): Promise<boolean>;
  setBackground(
    backgroundImage: ImageURISource | ImageRequireSource
  ): Promise<boolean>;
}

/**
 * Customize local peer's Video track settings before Joining the Room.
 *
 * Checkout Track Settings docs for more details {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/track-settings}
 */
export class HMSVideoTrackSettings {
  readonly simulcastSettings?: HMSSimulcastLayerSettings[];
  initialState?: HMSTrackSettingsInitState;
  cameraFacing?: HMSCameraFacing;
  forceSoftwareDecoder?: boolean; // android only
  disableAutoResize?: boolean; // android only
  videoPlugin?: HMSVirtualBackgroundPlugin;

  constructor(params: {
    simulcastSettings?: HMSSimulcastLayerSettings[];
    initialState?: HMSTrackSettingsInitState;
    cameraFacing?: HMSCameraFacing;
    forceSoftwareDecoder?: boolean;
    disableAutoResize?: boolean;
    videoPlugin?: HMSVirtualBackgroundPlugin;
  }) {
    this.simulcastSettings = params.simulcastSettings;
    this.initialState = params.initialState;
    this.cameraFacing = params.cameraFacing;
    this.forceSoftwareDecoder = params.forceSoftwareDecoder;
    this.disableAutoResize = params.disableAutoResize;
    this.videoPlugin = params.videoPlugin;
  }
}
