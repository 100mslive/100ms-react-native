import HMSAudioTrack from './HMSAudioTrack';
import type HMSAudioTrackSettings from './HMSAudioTrackSettings';

export default class HMSLocalAudioTrack extends HMSAudioTrack {
  settings?: HMSAudioTrackSettings;
  setMute?: Function;

  constructor(params: {
    trackId: string;
    source?: number;
    trackDescription?: string;
    settings?: HMSAudioTrackSettings;
  }) {
    super(params);
    this.settings = params.settings;
  }
}
