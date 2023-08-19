import type { HMSRTCStats } from './HMSRTCStats';

export class HMSRTCStatsReport {
  video?: HMSRTCStats;
  audio?: HMSRTCStats;
  combined?: HMSRTCStats;

  constructor(params: {
    video?: HMSRTCStats;
    audio?: HMSRTCStats;
    combined?: HMSRTCStats;
  }) {
    this.audio = params.audio;
    this.video = params.video;
    this.combined = params.combined;
  }
}
