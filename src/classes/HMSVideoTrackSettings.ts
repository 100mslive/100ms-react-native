import type { HMSVideoCodec } from './HMSVideoCodec';
import type { HMSSimulcastLayerSettings } from './HMSSimulcastLayerSettings';
import type { HMSCameraFacing } from './HMSCameraFacing';
import type { HMSVideoResolution } from './HMSVideoResolution';
import type { HMSTrackSettingsInitState } from './HMSTrackSettingsInitState';

export class HMSVideoTrackSettings {
  readonly codec?: HMSVideoCodec;
  readonly resolution?: HMSVideoResolution;
  readonly maxBitrate?: number;
  readonly maxFrameRate?: number;
  readonly trackDescription?: string;
  readonly simulcastSettings?: HMSSimulcastLayerSettings[];
  cameraFacing?: HMSCameraFacing;
  forceSoftwareDecoder?: boolean; // android only
  disableAutoResize?: boolean; // android only
  initialState?: HMSTrackSettingsInitState; // android only

  constructor(params: {
    codec?: HMSVideoCodec;
    resolution?: HMSVideoResolution;
    maxBitrate?: number;
    maxFrameRate?: number;
    trackDescription?: string;
    simulcastSettings?: HMSSimulcastLayerSettings[];
    cameraFacing?: HMSCameraFacing;
    forceSoftwareDecoder?: boolean;
    disableAutoResize?: boolean;
    initialState?: HMSTrackSettingsInitState;
  }) {
    this.codec = params.codec;
    this.resolution = params.resolution;
    this.maxBitrate = params.maxBitrate;
    this.maxFrameRate = params.maxFrameRate;
    this.trackDescription = params.trackDescription;
    this.simulcastSettings = params.simulcastSettings;
    this.cameraFacing = params.cameraFacing;
    this.forceSoftwareDecoder = params.forceSoftwareDecoder;
    this.disableAutoResize = params.disableAutoResize;
    this.initialState = params.initialState;
  }
}
