import { NativeModules } from 'react-native';
import { HMSVideoTrack } from './HMSVideoTrack';

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
    HmsManager.setPlaybackAllowed({ trackId: this.trackId, playbackAllowed });
  }

  isPlaybackAllowed = async () => {
    try {
      const val = await HmsManager.isPlaybackAllowed({ trackId: this.trackId });
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
  }) {
    super(params);
    this.layer = params.layer;
  }
}
