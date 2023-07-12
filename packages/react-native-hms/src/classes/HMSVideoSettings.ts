import type { HMSVideoCodec } from '..';

export class HMSVideoSettings {
  bitrate?: number;
  frameRate: number;
  width: number;
  height: number;
  codec: HMSVideoCodec;

  constructor(params: {
    bitrate?: number;
    frameRate: number;
    width: number;
    height: number;
    codec: HMSVideoCodec;
  }) {
    this.bitrate = params.bitrate;
    this.frameRate = params.frameRate;
    this.width = params.width;
    this.height = params.height;
    this.codec = params.codec;
  }
}
