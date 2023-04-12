import type { HMSLayer } from './HMSLayer';
import type { HMSVideoResolution } from './HMSVideoResolution';

export class HMSLocalVideoStats {
  bitrate?: number;
  bytesSent?: number;
  roundTripTime?: number;
  frameRate?: number;
  resolution?: HMSVideoResolution;
  layer?: HMSLayer;

  constructor(params: {
    bitrate?: number;
    bytesSent?: number;
    roundTripTime?: number;
    frameRate?: number;
    resolution?: HMSVideoResolution;
    layer?: HMSLayer;
  }) {
    this.bitrate = params.bitrate;
    this.bytesSent = params.bytesSent;
    this.roundTripTime = params.roundTripTime;
    this.frameRate = params.frameRate;
    this.resolution = params.resolution;
    this.layer = params.layer;
  }
}
