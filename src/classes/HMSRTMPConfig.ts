import type { HMSRtmpVideoResolution } from './HMSRtmpVideoResolution';

export class HMSRTMPConfig {
  meetingURL?: string;
  rtmpURLs?: Array<string>;
  record: boolean;
  resolution?: HMSRtmpVideoResolution;

  constructor(params: {
    meetingURL?: string;
    rtmpURLs?: Array<string>;
    record: boolean;
    resolution?: HMSRtmpVideoResolution;
  }) {
    this.meetingURL = params.meetingURL;
    this.rtmpURLs = params.rtmpURLs;
    this.record = params.record;
    this.resolution = params.resolution;
  }
}
