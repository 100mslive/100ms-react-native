export class HMSRTMPConfig {
  meetingURL?: string;
  rtmpURLs?: [string];
  record: boolean;

  constructor(params: {
    meetingURL?: string;
    rtmpURLs?: [string];
    record: boolean;
  }) {
    this.meetingURL = params.meetingURL;
    this.rtmpURLs = params.rtmpURLs;
    this.record = params.record;
  }
}
