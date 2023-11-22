import type { HMSQualityLimitationReason } from './HMSQualityLimitationReason';

export class HMSQualityLimitationReasons {
  bandwidth?: number;
  cpu?: number;
  none?: number;
  other?: number;
  qualityLimitationResolutionChanges?: number;
  reason: HMSQualityLimitationReason;

  constructor(params: {
    bandwidth?: number;
    cpu?: number;
    none?: number;
    other?: number;
    qualityLimitationResolutionChanges?: number;
    reason: HMSQualityLimitationReason;
  }) {
    this.bandwidth = params.bandwidth;
    this.cpu = params.cpu;
    this.none = params.none;
    this.other = params.other;
    this.qualityLimitationResolutionChanges =
      params.qualityLimitationResolutionChanges;
    this.reason = params.reason;
  }
}
