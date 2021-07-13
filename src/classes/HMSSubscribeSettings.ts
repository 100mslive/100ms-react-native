export default class HMSSubscribeSettings {
  subscribeToRoles?: [string];
  maxSubsBitRate: number;
  maxDisplayTiles?: number;

  constructor(params: {
    subscribeToRoles?: [string];
    maxSubsBitRate: number;
    maxDisplayTiles?: number;
  }) {
    this.subscribeToRoles = params.subscribeToRoles;
    this.maxSubsBitRate = params.maxSubsBitRate;
    this.maxDisplayTiles = params.maxDisplayTiles;
  }
}
