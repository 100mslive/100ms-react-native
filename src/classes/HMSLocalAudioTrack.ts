import { NativeModules, Platform } from 'react-native';
import { HMSAudioTrack } from './HMSAudioTrack';
import type { HMSAudioTrackSettings } from './HMSAudioTrackSettings';
import type { HMSTrackType } from './HMSTrackType';

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

export class HMSLocalAudioTrack extends HMSAudioTrack {
  settings?: HMSAudioTrackSettings;
  id: string;

  /**
   * Switches Audio of current user on/off depending upon the value of isMute
   *
   * @param {boolean} isMute
   * @memberof HMSLocalAudioTrack
   */
  setMute(isMute: boolean) {
    HmsManager.setLocalMute({ isMute, id: this.id });
  }

  setVolume = (volume: number) => {
    if (Platform.OS === 'ios') {
      return 'This API not available for IOS';
    } else {
      HmsManager.setVolume({
        id: this.id,
        trackId: this.trackId,
        volume,
      });
    }
  };

  getVolume = async () => {
    if (Platform.OS === 'ios') {
      return 'This API not available for IOS';
    }
    const volume = await HmsManager.getVolume({
      trackId: this.trackId,
      id: this.id,
    });

    return volume;
  };

  constructor(params: {
    id: string;
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: boolean;
    settings?: HMSAudioTrackSettings;
    type?: HMSTrackType;
  }) {
    super(params);
    this.id = params.id;
    this.settings = params.settings;
  }
}
