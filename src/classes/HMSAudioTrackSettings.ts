export class HMSAudioTrackSettings {
  maxBitrate?: number;
  trackDescription?: String;
  constructor(params: { maxBitrate: number; trackDescription?: String }) {
    this.maxBitrate = params.maxBitrate;
    this.trackDescription = params.trackDescription;
  }
}
