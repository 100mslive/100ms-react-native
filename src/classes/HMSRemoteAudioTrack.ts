import HMSAudioTrack from './HMSAudioTrack';

export default class HMSRemoteAudioTrack extends HMSAudioTrack {
  playbackAllowed?: boolean;
  isPlaybackAllowed?: Function;
  setPlaybackAllowed?: Function;
  constructor(params: {
    trackId: string;
    source?: number;
    isMute?: Boolean;
    trackDescription?: string;
    playbackAllowed?: boolean;
  }) {
    super(params);
    this.playbackAllowed = params.playbackAllowed;
  }
}
