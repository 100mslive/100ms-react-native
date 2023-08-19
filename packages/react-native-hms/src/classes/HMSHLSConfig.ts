import type { HMSHLSMeetingURLVariant } from './HMSHLSMeetingURLVariant';
import type { HMSHLSRecordingConfig } from './HMSHLSRecordingConfig';

export class HMSHLSConfig {
  hlsRecordingConfig?: HMSHLSRecordingConfig;
  meetingURLVariants?: Array<HMSHLSMeetingURLVariant>;

  constructor(params: {
    hlsRecordingConfig?: HMSHLSRecordingConfig;
    meetingURLVariants?: Array<HMSHLSMeetingURLVariant>;
  }) {
    this.hlsRecordingConfig = params.hlsRecordingConfig;
    this.meetingURLVariants = params.meetingURLVariants;
  }
}
