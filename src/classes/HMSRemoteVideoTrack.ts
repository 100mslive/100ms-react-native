import { HMSVideoTrack } from './HMSVideoTrack';

export class HMSRemoteVideoTrack extends HMSVideoTrack {
  layer?: any; //TODO: layer to be made HMSSimulcastLayer type
  isPlaybackAllowed?: Function;
  setPlaybackAllowed?: Function;
  playbackAllowed?: boolean;

  constructor(params: {
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: boolean;
    layer?: any;
    playbackAllowed?: boolean;
  }) {
    super(params);
    this.layer = params.layer;
    this.playbackAllowed = params.playbackAllowed;
  }
}
