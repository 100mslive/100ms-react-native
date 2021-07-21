import type HMSSimulcastLayerSettings from './HMSSimulcastLayerSettings';

export default class HMSVideoTrackSettings {
  codec?: any; //TODO: make it HMSCodec Type
  resolution?: any; //TODO: make it HMSVideoResolution Type
  maxBitrate?: number;
  maxFrameRate?: number;
  cameraFacing?: any; //TODO: make it HMSCameraFacing type
  trackDescription?: String;
  simulcastSettings?: HMSSimulcastLayerSettings[];

  constructor(params: {
    codec?: any; //TODO: make it HMSCodec Type
    resolution?: any; //TODO: make it HMSVideoResolution Type
    maxBitrate?: number;
    maxFrameRate?: number;
    cameraFacing?: any; //TODO: make it HMSCameraFacing type
    trackDescription?: String;
    simulcastSettings?: HMSSimulcastLayerSettings[];
  }) {
    this.codec = params.codec;
    this.resolution = params.resolution;
    this.maxBitrate = params.maxBitrate;
    this.maxFrameRate = params.maxFrameRate;
    this.cameraFacing = params.cameraFacing;
    this.trackDescription = params.trackDescription;
    this.simulcastSettings = params.simulcastSettings;
  }
}
