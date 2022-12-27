export class HMSSubscribeDegradationPolicy {
  packetLossThreshold?: number;
  degradeGracePeriodSeconds?: number;
  recoverGracePeriodSeconds?: number;
  constructor(params: {
    packetLossThreshold?: number;
    degradeGracePeriodSeconds?: number;
    recoverGracePeriodSeconds?: number;
  }) {
    this.packetLossThreshold = params.packetLossThreshold;
    this.degradeGracePeriodSeconds = params.degradeGracePeriodSeconds;
    this.recoverGracePeriodSeconds = params.recoverGracePeriodSeconds;
  }
}
