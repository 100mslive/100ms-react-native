import type { HMSAudioTrackSettings } from './HMSAudioTrackSettings';
import type { HMSVideoTrackSettings } from './HMSVideoTrackSettings';

export class HMSTrackSettings {
  video?: HMSVideoTrackSettings;
  audio?: HMSAudioTrackSettings;
  useHardwareEchoCancellation?: boolean;

  constructor(params?: {
    video?: HMSVideoTrackSettings;
    audio?: HMSAudioTrackSettings;
    useHardwareEchoCancellation?: boolean;
  }) {
    if (params) {
      this.video = params.video;
      this.audio = params.audio;
      this.useHardwareEchoCancellation = params.useHardwareEchoCancellation;
    }
  }
}
