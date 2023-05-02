import type { HMSIOSAudioMode } from './HMSIOSAudioMode';
import type { HMSTrackSettingsInitState } from './HMSTrackSettingsInitState';

export class HMSAudioTrackSettings {
  initialState?: HMSTrackSettingsInitState;
  useHardwareEchoCancellation?: boolean; // android only
  audioSource?: string[]; // ios only
  audioMode?: HMSIOSAudioMode; // ios only

  constructor(params: {
    initialState?: HMSTrackSettingsInitState;
    useHardwareEchoCancellation?: boolean;
    audioSource?: string[];
    audioMode?: HMSIOSAudioMode;
  }) {
    this.useHardwareEchoCancellation = params.useHardwareEchoCancellation;
    this.initialState = params.initialState;
    this.audioSource = params.audioSource;
    this.audioMode = params.audioMode;
  }
}
