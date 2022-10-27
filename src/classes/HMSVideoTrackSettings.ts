import type { HMSSimulcastLayerSettings } from './HMSSimulcastLayerSettings';
import type { HMSCameraFacing } from './HMSCameraFacing';
import type { HMSTrackSettingsInitState } from './HMSTrackSettingsInitState';

export class HMSVideoTrackSettings {
  readonly simulcastSettings?: HMSSimulcastLayerSettings[];
  initialState?: HMSTrackSettingsInitState;
  cameraFacing?: HMSCameraFacing;
  forceSoftwareDecoder?: boolean; // android only
  disableAutoResize?: boolean; // android only

  constructor(params: {
    simulcastSettings?: HMSSimulcastLayerSettings[];
    initialState?: HMSTrackSettingsInitState;
    cameraFacing?: HMSCameraFacing;
    forceSoftwareDecoder?: boolean;
    disableAutoResize?: boolean;
  }) {
    this.simulcastSettings = params.simulcastSettings;
    this.initialState = params.initialState;
    this.cameraFacing = params.cameraFacing;
    this.forceSoftwareDecoder = params.forceSoftwareDecoder;
    this.disableAutoResize = params.disableAutoResize;
  }
}
