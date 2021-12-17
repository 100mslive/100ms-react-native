import { NativeModules } from 'react-native';
import { HMSSDK } from './HMSSDK';
import { HMSVideoTrack } from './HMSVideoTrack';
import type { HMSTrackType } from './HMSTrackType';

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

export class HMSRemoteVideoTrack extends HMSVideoTrack {
  layer?: any; //TODO: layer to be made HMSSimulcastLayer type

  /**
   * Switches Video of remote user on/off depending upon the value of playbackAllowed
   *
   * @param {boolean} playbackAllowed
   * @memberof HMSRemoteVideoTrack
   */
  setPlaybackAllowed(playbackAllowed: boolean) {
    const logger = HMSSDK.getLogger();
    logger?.verbose('#Function setPlaybackAllowed', {
      trackId: this.trackId,
      id: this.id,
      source: this.source,
      type: this.type,
      playbackAllowed,
    });
    HmsManager.setPlaybackAllowed({
      id: this.id,
      trackId: this.trackId,
      playbackAllowed,
    });
  }

  isPlaybackAllowed = async () => {
    try {
      const logger = HMSSDK.getLogger();
      logger?.verbose('#Function isPlaybackAllowed', {
        trackId: this.trackId,
        id: this.id,
        source: this.source,
        type: this.type,
      });
      const val = await HmsManager.isPlaybackAllowed({
        id: this.id,
        trackId: this.trackId,
      });
      return val;
    } catch (e) {
      return true;
    }
  };

  constructor(params: {
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: boolean;
    layer?: any;
    playbackAllowed?: boolean;
    id: string;
    type?: HMSTrackType;
  }) {
    super(params);
    this.layer = params.layer;
  }
}
