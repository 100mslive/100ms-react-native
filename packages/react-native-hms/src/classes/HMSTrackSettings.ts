import type { HMSAudioTrackSettings } from './HMSAudioTrackSettings';
import type { HMSVideoTrackSettings } from './HMSVideoTrackSettings';

/**
 * Represents the settings for both video and audio tracks in a HMS (100ms) application.
 *
 * This class encapsulates the configurations for video and audio tracks that can be used
 * in a HMS session.
 *
 * @property {HMSVideoTrackSettings} video - Optional video track settings.
 * @property {HMSAudioTrackSettings} audio - Optional audio track settings.
 *
 */
export class HMSTrackSettings {
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
