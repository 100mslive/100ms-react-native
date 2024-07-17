import { HMSTrack } from './HMSTrack';
import type { HMSTrackSource } from './HMSTrackSource';
import type { HMSTrackType } from './HMSTrackType';

/**
 * Represents a video track within the HMS (100ms) system.
 *
 * This class extends `HMSTrack` to provide functionalities specific to video tracks. It includes additional
 * property `isDegraded` to indicate whether the video quality has been intentionally reduced, typically for
 * performance reasons. The constructor allows for the initialization of the video track with various parameters
 * such as track ID, source, description, mute state, degradation state, ID, and type. These parameters provide
 * detailed information about the video track and its characteristics.
 *
 * @extends HMSTrack
 *
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/set-up-video-conferencing/render-video/overview
 */
export class HMSVideoTrack extends HMSTrack {
  /**
   * Indicates whether the video quality of the track is degraded.
   * @type {boolean | undefined}
   */
  isDegraded?: boolean;

  constructor(params: {
    trackId: string;
    source?: HMSTrackSource;
    trackDescription?: string;
    isMute?: boolean;
    id: string;
    isDegraded?: boolean;
    type?: HMSTrackType;
  }) {
    super(params);
    this.isDegraded = params.isDegraded;
  }
}
