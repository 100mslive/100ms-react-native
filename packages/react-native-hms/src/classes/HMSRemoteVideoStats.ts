import type { HMSVideoResolution } from './HMSVideoResolution';

export class HMSRemoteVideoStats {
  bitrate?: number;
  packetsReceived?: number;
  packetsLost?: number;
  bytesReceived?: number;
  jitter?: number;
  resolution?: HMSVideoResolution;
  frameRate?: number;

  constructor(params: {
    bitrate?: number;
    packetsReceived?: number;
    packetsLost?: number;
    bytesReceived?: number;
    jitter?: number;
    resolution?: HMSVideoResolution;
    frameRate?: number;
  }) {
    this.bitrate = params.bitrate;
    this.packetsReceived = params.packetsReceived;
    this.packetsLost = params.packetsLost;
    this.bytesReceived = params.bytesReceived;
    this.jitter = params.jitter;
    this.resolution = params.resolution;
    this.frameRate = params.frameRate;
  }
}
