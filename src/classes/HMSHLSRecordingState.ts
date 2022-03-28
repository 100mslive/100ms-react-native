export class HMSHLSRecordingState {
  singleFilePerLayer: boolean;
  videoOnDemand: boolean;
  running: boolean;
  startedAt?: Date;

  constructor(params: {
    singleFilePerLayer: boolean;
    videoOnDemand: boolean;
    running: boolean;
    startedAt?: Date;
  }) {
    this.singleFilePerLayer = params.singleFilePerLayer;
    this.videoOnDemand = params.videoOnDemand;
    this.running = params.running;
    this.startedAt = params.startedAt;
  }
}
