import { NativeModules } from 'react-native';
import { HMSVideoTrack } from './HMSVideoTrack';
import { getLogger } from './HMSLogger';
import type { HMSVideoTrackSettings } from './HMSVideoTrackSettings';
import type { HMSTrackType } from './HMSTrackType';
import type { HMSTrackSource } from './HMSTrackSource'

const {
  /**
   * @ignore
   */
  HMSManager,
} = NativeModules;

export class HMSLocalVideoTrack extends HMSVideoTrack {
  settings?: HMSVideoTrackSettings;
  id: string;

  /**
   * switches camera between front/back
   *
   * @memberof HMSSDK
   */
  switchCamera = () => {
    const logger = getLogger();
    logger?.verbose('#Function switchCamera', {
      trackId: this.trackId,
      source: this.source,
      type: this.type,
      id: this.id,
    });
    HMSManager.switchCamera({ id: this.id });
  };

  /**
   * Switches local video feed on/off depending upon the value of isMute
   *
   * @param {boolean} isMute
   * @memberof HMSLocalVideoTrack
   */
  setMute(isMute: boolean) {
    const logger = getLogger();
    logger?.verbose('#Function setMute', {
      trackId: this.trackId,
      source: this.source,
      type: this.type,
      id: this.id,
    });
    HMSManager.setLocalVideoMute({ isMute, id: this.id });
  }

  constructor(params: {
    id: string;
    trackId: string;
    source?: HMSTrackSource;
    trackDescription?: string;
    isMute?: boolean;
    settings?: HMSVideoTrackSettings;
    type?: HMSTrackType;
  }) {
    super(params);
    this.settings = params.settings;
    this.id = params.id;
  }
}
