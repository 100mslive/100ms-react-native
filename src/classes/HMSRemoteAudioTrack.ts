import { NativeModules } from 'react-native';

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

import { HMSAudioTrack } from './HMSAudioTrack';

export class HMSRemoteAudioTrack extends HMSAudioTrack {
  // playbackAllowed?: boolean;
  // isPlaybackAllowed?: Function;
  // setPlaybackAllowed?: Function;

  /**
   * Switches Audio of remote user on/off depending upon the value of playbackAllowed
   *
   * @param {boolean} playbackAllowed
   * @memberof HMSRemoteAudioTrack
   */
  setPlaybackAllowed(playbackAllowed: boolean) {
    HmsManager.setPlaybackAllowed({ trackId: this.trackId, playbackAllowed });
  }

  isPlaybackAllowed = async () => {
    try {
      let val = await HmsManager.isPlaybackAllowed({ trackId: this.trackId });
      return val;
    } catch (e) {
      return true;
    }
  };

  constructor(params: {
    trackId: string;
    source?: number | string;
    isMute?: boolean;
    trackDescription?: string;
    // playbackAllowed?: boolean;
  }) {
    super(params);
    // this.playbackAllowed = params.playbackAllowed;
  }
}
