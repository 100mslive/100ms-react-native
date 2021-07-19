import HMSVideoTrack from './HMSVideoTrack';
import type HMSVideoTrackSettings from './HMSVideoTrackSettings';

export default class HMSLocalVideoTrack extends HMSVideoTrack {
  settings?: HMSVideoTrackSettings;
  setMute?: Function;
  startCapturing?: Function;
  stopCapturing?: Function;
  switchCamera?: Function;

  constructor(params: {
    trackId: string;
    source?: number;
    trackDescription?: string;
    settings?: HMSVideoTrackSettings;
  }) {
    super(params);
    this.settings = params.settings;
  }
}
