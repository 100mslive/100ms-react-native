import type { HMSLayer } from './HMSLayer';
import type { HMSQualityLimitationReasons } from './HMSQualityLimitationReasons';
import type { HMSVideoResolution } from './HMSVideoResolution';

export class HMSLocalVideoStats {
  // Outgoing bitrate of this track observed since previous report in Kb/s.
  bitrate?: number;

  // Total bytes sent by this track in the current session.
  bytesSent?: number;

  // Round trip time observed since previous report
  roundTripTime?: number;

  // Frame rate of video frames being sent (FPS)
  frameRate?: number;

  // Resolution of video frames being sent
  resolution?: HMSVideoResolution;

  // Reason for quality limitations
  qualityLimitationReasons?: HMSQualityLimitationReasons;

  /// Simulcast Layer
  layer?: HMSLayer;

  constructor(params: {
    bitrate?: number;
    bytesSent?: number;
    roundTripTime?: number;
    frameRate?: number;
    resolution?: HMSVideoResolution;
    qualityLimitationReasons?: HMSQualityLimitationReasons;
    layer?: HMSLayer;
  }) {
    this.bitrate = params.bitrate;
    this.bytesSent = params.bytesSent;
    this.roundTripTime = params.roundTripTime;
    this.frameRate = params.frameRate;
    this.resolution = params.resolution;
    this.qualityLimitationReasons = params.qualityLimitationReasons;
    this.layer = params.layer;
  }
}
