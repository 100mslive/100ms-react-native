import type HMSAudioCodec from './HMSAudioCodec';

export default class HMSAudioSettings {
  bitRate: number;
  codec: HMSAudioCodec;

  constructor(params: { bitRate: number; codec: HMSAudioCodec }) {
    this.bitRate = params.bitRate;
    this.codec = params.codec;
  }
}
