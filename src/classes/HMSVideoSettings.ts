import type HMSAudioCodec from './HMSAudioCodec';

export default class HMSVideoSettings {
  bitrate?: number;
  frameRate: number;
  width: number;
  height: number;
  codec: HMSAudioCodec;

  constructor(params: {
    bitrate?: number;
    frameRate: number;
    width: number;
    height: number;
    codec: HMSAudioCodec;
  }) {
    this.bitrate = params.bitrate;
    this.frameRate = params.frameRate;
    this.width = params.width;
    this.height = params.height;
    this.codec = params.codec;
  }
}
