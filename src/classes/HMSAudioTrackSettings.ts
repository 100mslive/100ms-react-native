import type { HMSAudioCodec } from './HMSAudioCodec';

export class HMSAudioTrackSettings {
  maxBitrate: number;
  trackDescription?: string; // ios only
  audioSource?: string[]; // ios only
  codec?: HMSAudioCodec; // android only
  constructor(params: {
    maxBitrate: number;
    trackDescription?: string;
    audioSource?: string[];
    codec?: HMSAudioCodec;
  }) {
    this.maxBitrate = params.maxBitrate;
    this.trackDescription = params.trackDescription;
    this.audioSource = params.audioSource;
    this.codec = params.codec;
  }
}
