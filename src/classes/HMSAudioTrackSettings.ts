import type { HMSAudioCodec } from './HMSAudioCodec';
import type { HMSTrackSettingsInitState } from './HMSTrackSettingsInitState';

export class HMSAudioTrackSettings {
  readonly maxBitrate?: number;
  readonly trackDescription?: string; // ios only
  readonly codec?: HMSAudioCodec; // android only
  useHardwareEchoCancellation?: boolean; // android only
  initialState?: HMSTrackSettingsInitState; // android only
  audioSource?: string[]; // ios only

  constructor(params: {
    maxBitrate?: number;
    trackDescription?: string;
    codec?: HMSAudioCodec;
    useHardwareEchoCancellation?: boolean;
    initialState?: HMSTrackSettingsInitState;
    audioSource?: string[];
  }) {
    this.maxBitrate = params.maxBitrate;
    this.trackDescription = params.trackDescription;
    this.codec = params.codec;
    this.useHardwareEchoCancellation = params.useHardwareEchoCancellation;
    this.initialState = params.initialState;
    this.audioSource = params.audioSource;
  }
}
