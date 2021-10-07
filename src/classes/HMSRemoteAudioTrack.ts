import { HMSAudioTrack } from './HMSAudioTrack';

export class HMSRemoteAudioTrack extends HMSAudioTrack {
  playbackAllowed?: boolean;
  isPlaybackAllowed?: Function;
  setPlaybackAllowed?: Function;
  constructor(params: {
    trackId: string;
    source?: number | string;
    isMute?: boolean;
    trackDescription?: string;
    playbackAllowed?: boolean;
  }) {
    super(params);
    this.playbackAllowed = params.playbackAllowed;
  }
}
