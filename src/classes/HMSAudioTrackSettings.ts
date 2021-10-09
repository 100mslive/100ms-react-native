export class HMSAudioTrackSettings {
  maxBitrate?: number;
  trackDescription?: string;
  constructor(params: { maxBitrate: number; trackDescription?: string }) {
    this.maxBitrate = params.maxBitrate;
    this.trackDescription = params.trackDescription;
  }
}
