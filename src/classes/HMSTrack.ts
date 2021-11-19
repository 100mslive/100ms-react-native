import { NativeModules } from 'react-native';
import type { HMSTrackType } from './HMSTrackType';

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

export class HMSTrack {
  trackId: string;
  source?: number | string;
  trackDescription?: string;
  mute?: boolean;
  id: string;
  type?: HMSTrackType;

  isMute = async () => {
    try {
      let val = await HmsManager.isMute({ trackId: this.trackId, id: this.id });
      return val;
    } catch (err) {
      return true;
    }
  };

  constructor(params: {
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: boolean;
    id: string;
    type?: HMSTrackType;
  }) {
    this.trackId = params.trackId;
    this.source = params.source;
    this.trackDescription = params.trackDescription;
    this.mute = params.isMute;
    this.id = params.id;
    this.type = params.type;
  }
}
