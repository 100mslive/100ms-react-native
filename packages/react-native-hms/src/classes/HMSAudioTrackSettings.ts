import type { HMSIOSAudioMode } from './HMSIOSAudioMode';
import type { HMSNoiseCancellationPlugin } from './HMSNoiseCancellationPlugin';
import type { HMSTrackSettingsInitState } from './HMSTrackSettingsInitState';

/**
 * Customize local peer's Audio track settings before Joining the Room.
 *
 * Checkout Track Settings docs for more details {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/track/track-settings}
 */
export class HMSAudioTrackSettings {
  initialState?: HMSTrackSettingsInitState;
  useHardwareEchoCancellation?: boolean; // android only
  audioSource?: string[]; // ios only

  /**
   * [iOS only] `audioMode` allows you to capture audio in its highest quality
   * by disabling voice processing and increasing the maximum bandwidth limit
   *
   * Checkout Music Mode docs for more details {@link https://www.100ms.live/docs/react-native/v2/how-to-guides/configure-your-device/microphone/music-mode}
   */
  audioMode?: HMSIOSAudioMode; // ios only

  noiseCancellationPlugin?: HMSNoiseCancellationPlugin;

  constructor(params: {
    initialState?: HMSTrackSettingsInitState;
    useHardwareEchoCancellation?: boolean;
    audioSource?: string[];
    audioMode?: HMSIOSAudioMode;
    noiseCancellationPlugin?: HMSNoiseCancellationPlugin;
  }) {
    this.useHardwareEchoCancellation = params.useHardwareEchoCancellation;
    this.initialState = params.initialState;
    this.audioSource = params.audioSource;
    this.audioMode = params.audioMode;
    this.noiseCancellationPlugin = params.noiseCancellationPlugin;
  }
}
