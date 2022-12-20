import type { HMSSubscribeDegradationPolicy } from "./HMSSubscribeDegradationPolicy";

export class HMSSubscribeSettings {
  subscribeTo?: [string];
  maxSubsBitRate: number;
  subscribeDegradation?: HMSSubscribeDegradationPolicy;
  constructor(params: {
    subscribeTo?: [string];
    maxSubsBitRate: number;
    subscribeDegradation?: HMSSubscribeDegradationPolicy;
  }) {
    this.subscribeTo = params.subscribeTo;
    this.maxSubsBitRate = params.maxSubsBitRate;
    this.subscribeDegradation = params.subscribeDegradation;
  }
}
