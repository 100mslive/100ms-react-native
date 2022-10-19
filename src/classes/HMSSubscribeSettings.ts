export class HMSSubscribeSettings {
  subscribeTo?: [string];
  maxSubsBitRate: number;
  maxDisplayTiles?: number;

  constructor(params: {
    subscribeTo?: [string];
    maxSubsBitRate: number;
    maxDisplayTiles?: number;
  }) {
    this.subscribeTo = params.subscribeTo;
    this.maxSubsBitRate = params.maxSubsBitRate;
    this.maxDisplayTiles = params.maxDisplayTiles;
  }
}
