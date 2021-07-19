import type HMSAudioTrackSettings from './HMSAudioTrackSettings';
import type HMSVideoTrackSettings from './HMSVideoTrackSettings';

export default class HMSTrackSettings {
  video?: HMSVideoTrackSettings;
  audio?: HMSAudioTrackSettings;

  constructor(params?: {
    video?: HMSVideoTrackSettings;
    audio?: HMSAudioTrackSettings;
  }) {
    if (params) {
      this.video = params.video;
      this.audio = params.audio;
    }
  }
}
