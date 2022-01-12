import type { HMSHLSMeetingURLVariant } from './HMSHLSMeetingURLVariant';

export class HMSHLSConfig {
  meetingURLVariants?: Array<HMSHLSMeetingURLVariant>;

  constructor(params: { meetingURLVariants?: Array<HMSHLSMeetingURLVariant> }) {
    this.meetingURLVariants = params.meetingURLVariants;
  }
}
