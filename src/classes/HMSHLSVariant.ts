export class HMSHLSVariant {
  hlsStreamUrl: string;
  meetingUrl: string;
  metadata: string;
  startedAt: number;

  constructor(params: {
    hlsStreamUrl: string;
    meetingUrl: string;
    metadata: string;
    startedAt: number;
  }) {
    this.hlsStreamUrl = params.hlsStreamUrl;
    this.meetingUrl = params.meetingUrl;
    this.metadata = params.metadata;
    this.startedAt = params.startedAt;
  }
}
