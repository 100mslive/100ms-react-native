import type { HMSTrackSource } from './HMSTrackSource';
import type { HMSTrackType } from './HMSTrackType';

/**
 * Represents a generic track within the HMS (100ms) system.
 *
 * This class serves as a base for different types of tracks (audio, video, etc.) within the HMS system. It encapsulates
 * common properties and functionalities that are shared across different track types.
 *
 * @property {string} trackId - The unique identifier for the track.
 * @property {HMSTrackSource} [source] - The source of the track, indicating whether it's from a plugin, regular input, or screen sharing.
 * @property {string} [trackDescription] - A brief description of the track.
 * @property {boolean} [mute] - Indicates whether the track is currently muted.
 * @property {string} id - A secondary identifier for the track.
 * @property {HMSTrackType} [type] - The type of the track, distinguishing between audio and video.
 */
export class HMSTrack {
  trackId: string;
  source?: HMSTrackSource;
  trackDescription?: string;
  mute?: boolean;
  id: string;
  type?: HMSTrackType;

  isMute = () => {
    return this.mute;
  };

  constructor(params: {
    trackId: string;
    source?: HMSTrackSource;
    trackDescription?: string;
    isMute?: boolean;
    id: string;
    type?: HMSTrackType;
  }) {
    this.trackId = params.trackId;
    this.source = params.source;
    this.trackDescription = params.trackDescription;
    this.mute = params.isMute;
    this.id = params.id;
    this.type = params.type;
  }
}
