import HMSVideoTrack from './HMSVideoTrack';

export default class HMSRemoteVideoTrack extends HMSVideoTrack {
  layer?: any; //TODO: layer to be made HMSSimulcastLayer type
  isPlaybackAllowed?: Function;
  setPlaybackAllowed?: Function;

  constructor(params: {
    trackId: string;
    source?: number;
    trackDescription?: string;
    layer?: any;
  }) {
    super(params);
    this.layer = params.layer;
  }
}
