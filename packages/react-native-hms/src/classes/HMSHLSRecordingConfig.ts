export class HMSHLSRecordingConfig {
  singleFilePerLayer: boolean;
  videoOnDemand: boolean;

  constructor(params: { singleFilePerLayer: boolean; videoOnDemand: boolean }) {
    this.singleFilePerLayer = params.singleFilePerLayer;
    this.videoOnDemand = params.videoOnDemand;
  }
}
