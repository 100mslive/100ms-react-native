import { NativeModules } from 'react-native';
import { HMSVideoTrack } from './HMSVideoTrack';
import { getLogger } from './HMSLogger';
import type { HMSVideoTrackSettings } from './HMSVideoTrackSettings';
import type { HMSTrackType } from './HMSTrackType';

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

export class HMSLocalVideoTrack extends HMSVideoTrack {
  settings?: HMSVideoTrackSettings;
  startCapturing?: Function;
  stopCapturing?: Function;
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
    HmsManager.switchCamera({ id: this.id });
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
    HmsManager.setLocalVideoMute({ isMute, id: this.id });
  }

  constructor(params: {
    id: string;
    trackId: string;
    source?: number | string;
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
