export class HMSHLSMeetingURLVariant {
  meetingUrl: string;
  metadata: string;

  constructor(params: { meetingUrl: string; metadata: string }) {
    this.meetingUrl = params.meetingUrl;
    this.metadata = params.metadata;
  }
}
