export class HMSSimulcastLayerSettings {
  maxBitrate?: number;
  maxFrameRate?: number;
  scaleResolutionDownBy?: number;
  rid?: String;

  constructor(params: {
    rid: String;
    maxBitrate: number;
    maxFrameRate: number;
    scaleResolutionDownBy: number;
  }) {
    this.rid = params.rid;
    this.maxBitrate = params.maxBitrate;
    this.maxFrameRate = params.maxFrameRate;
    this.scaleResolutionDownBy = params.scaleResolutionDownBy;
  }
}
