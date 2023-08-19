export class HMSHLSVariant {
  hlsStreamUrl?: string;
  meetingUrl?: string;
  metadata?: string;
  startedAt?: Date;

  constructor(params: {
    hlsStreamUrl?: string;
    meetingUrl?: string;
    metadata?: string;
    startedAt?: Date;
  }) {
    this.hlsStreamUrl = params.hlsStreamUrl;
    this.meetingUrl = params.meetingUrl;
    this.metadata = params.metadata;
    this.startedAt = params.startedAt;
  }
}
