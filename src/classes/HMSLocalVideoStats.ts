import type { HMSVideoResolution } from './HMSVideoResolution';

export class HMSLocalVideoStats {
  bitrate?: number;
  bytesSent?: number;
  roundTripTime?: number;
  frameRate?: number;
  resolution?: HMSVideoResolution;

  constructor(params: {
    bitrate?: number;
    bytesSent?: number;
    roundTripTime?: number;
    frameRate?: number;
    resolution?: HMSVideoResolution;
  }) {
    this.bitrate = params.bitrate;
    this.bytesSent = params.bytesSent;
    this.roundTripTime = params.roundTripTime;
    this.frameRate = params.frameRate;
    this.resolution = params.resolution;
  }
}
