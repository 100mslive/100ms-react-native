import HMSTrack from './HMSTrack';

export default class HMSVideoTrack extends HMSTrack {
  isDegraded?: Function;
  addSink?: Function;
  removeSink?: Function;

  constructor(params: {
    trackId: string;
    source?: number;
    trackDescription?: string;
    isMute?: Boolean;
  }) {
    super(params);
  }
}
