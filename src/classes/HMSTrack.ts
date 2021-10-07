export class HMSTrack {
  trackId: string;
  source?: number | string;
  trackDescription?: string;
  isMute?: Function;
  mute?: boolean;

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
