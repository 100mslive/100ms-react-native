import HMSAudioTrack from './HMSAudioTrack';

export default class HMSRemoteAudioTrack extends HMSAudioTrack {
  isPlaybackAllowed?: Function;
  setPlaybackAllowed?: Function;
  constructor(params: {
    trackId: string;
    source?: number;
    trackDescription?: string;
  }) {
    if (params) {
      super(params);
    }
  }
}
