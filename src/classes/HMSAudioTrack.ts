import HMSTrack from './HMSTrack';

export default class HMSAudioTrack extends HMSTrack {
  constructor(params?: {
    trackId: string;
    source?: number;
    trackDescription?: string;
    isMute?: Boolean;
  }) {
    if (params) {
      super(params);
    }
  }
}
