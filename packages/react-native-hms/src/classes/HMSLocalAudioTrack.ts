import { NativeModules, Platform } from 'react-native';
import { HMSAudioTrack } from './HMSAudioTrack';
import { getLogger } from './HMSLogger';
import type { HMSAudioTrackSettings } from './HMSAudioTrackSettings';
import type { HMSTrackType } from './HMSTrackType';
import type { HMSTrackSource } from './HMSTrackSource';

const {
  /**
   * @ignore
   */
  HMSManager,
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
    const logger = getLogger();
    logger?.verbose('#Function setMute', {
      trackId: this.trackId,
      id: this.id,
      source: this.source,
      type: this.type,
      isMute,
    });
    HMSManager.setLocalMute({ isMute, id: this.id });
  }

  getVolume = async () => {
    const logger = getLogger();
    logger?.verbose('#Function getVolume', {
      trackId: this.trackId,
      id: this.id,
      source: this.source,
      type: this.type,
    });
    if (Platform.OS === 'ios') {
      return 'This API not available for IOS';
    }
    const volume = await HMSManager.getVolume({
      trackId: this.trackId,
      id: this.id,
    });

    return volume;
  };

  constructor(params: {
    id: string;
    trackId: string;
    source?: HMSTrackSource;
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
