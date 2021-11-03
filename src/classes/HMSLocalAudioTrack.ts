import { NativeModules } from 'react-native';
import { HMSAudioTrack } from './HMSAudioTrack';
import type { HMSAudioTrackSettings } from './HMSAudioTrackSettings';

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

  constructor(params: {
    id: string;
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: boolean;
    settings?: HMSAudioTrackSettings;
  }) {
    super(params);
    this.id = params.id;
    this.settings = params.settings;
  }
}
