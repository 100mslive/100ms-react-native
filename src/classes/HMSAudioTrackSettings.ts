import type { HMSTrackSettingsInitState } from './HMSTrackSettingsInitState';

export class HMSAudioTrackSettings {
  initialState?: HMSTrackSettingsInitState;
  useHardwareEchoCancellation?: boolean; // android only
  audioSource?: string[]; // ios only

  constructor(params: {
    initialState?: HMSTrackSettingsInitState;
    useHardwareEchoCancellation?: boolean;
    audioSource?: string[];
  }) {
    this.useHardwareEchoCancellation = params.useHardwareEchoCancellation;
    this.initialState = params.initialState;
    this.audioSource = params.audioSource;
  }
}
