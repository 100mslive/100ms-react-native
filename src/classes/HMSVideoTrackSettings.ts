import type { HMSVideoCodec } from './HMSVideoCodec';
import type { HMSSimulcastLayerSettings } from './HMSSimulcastLayerSettings';
import type { HMSCameraFacing } from './HMSCameraFacing';
import type { HMSVideoResolution } from './HMSVideoResolution';

export class HMSVideoTrackSettings {
  codec: HMSVideoCodec;
  resolution: HMSVideoResolution;
  maxBitrate: number;
  maxFrameRate: number;
  cameraFacing: HMSCameraFacing;
  trackDescription?: string;
  simulcastSettings?: HMSSimulcastLayerSettings[];

  constructor(params: {
    codec: HMSVideoCodec;
    resolution: HMSVideoResolution;
    maxBitrate: number;
    maxFrameRate: number;
    cameraFacing: HMSCameraFacing;
    trackDescription?: string;
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
