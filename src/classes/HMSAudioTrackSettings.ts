import type { HMSAudioCodec } from './HMSAudioCodec';

export class HMSAudioTrackSettings {
  maxBitrate?: number;
  trackDescription?: string;
  codec?: HMSAudioCodec;
  constructor(params: {
    maxBitrate: number;
    trackDescription?: string;
    codec: HMSAudioCodec;
  }) {
    this.maxBitrate = params.maxBitrate;
    this.trackDescription = params.trackDescription;
    this.codec = params.codec;
  }
}
