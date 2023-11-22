export class HMSSimulcastLayerSettings {
  maxBitrate?: number;
  maxFrameRate?: number;
  scaleResolutionDownBy?: number;
  rid?: string;

  constructor(params: {
    rid: string;
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
