export class HMSSubscribeSettings {
  subscribeTo?: [string];
  maxSubsBitRate: number;

  constructor(params: { subscribeTo?: [string]; maxSubsBitRate: number }) {
    this.subscribeTo = params.subscribeTo;
    this.maxSubsBitRate = params.maxSubsBitRate;
  }
}
