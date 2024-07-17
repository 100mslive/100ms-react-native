import { HMSTrack } from './HMSTrack';
import type { HMSTrackSource } from './HMSTrackSource';
import type { HMSTrackType } from './HMSTrackType';

/**
 * Represents an audio track within the HMS (100ms) system.
 *
 * This class extends `HMSTrack` to provide functionalities specific to audio tracks. It includes a constructor
 * that allows for the initialization of the audio track with various parameters such as track ID, source, description,
 * mute state, ID, and type. These parameters provide detailed information about the audio track and its characteristics.
 *
 * @extends HMSTrack
 */
export class HMSAudioTrack extends HMSTrack {
  constructor(params?: {
    trackId: string;
    source?: HMSTrackSource;
    trackDescription?: string;
    isMute?: boolean;
    id: string;
    type?: HMSTrackType;
  }) {
    if (params) {
      super(params);
    }
  }
}
