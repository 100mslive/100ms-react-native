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
  id: string;

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
  }) {
    this.trackId = params.trackId;
    this.source = params.source;
    this.trackDescription = params.trackDescription;
    this.mute = params.isMute;
    this.id = params.id;
  }
}
