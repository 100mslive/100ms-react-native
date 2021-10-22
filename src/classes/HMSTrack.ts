import { NativeModules } from 'react-native';

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

  isMute = async () => {
    try {
      let val = await HmsManager.isMute({ trackId: this.trackId });
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
  }) {
    this.trackId = params.trackId;
    this.source = params.source;
    this.trackDescription = params.trackDescription;
    this.mute = params.isMute;
  }
}
