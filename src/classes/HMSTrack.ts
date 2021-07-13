export default class HMSTrack {
  trackId?: string;
  source?: number;
  trackDescription?: string;
  isMute?: Function;

  constructor(params?: {
    trackId?: string;
    source?: number;
    trackDescription?: string;
  }) {
    if (params) {
      this.trackId = params.trackId;
      this.source = params.source;
      this.trackDescription = params.trackDescription;
    }
  }
}
