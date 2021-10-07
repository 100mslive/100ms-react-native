import { HMSTrack } from './HMSTrack';

export class HMSVideoTrack extends HMSTrack {
  isDegraded?: Function;
  addSink?: Function;
  removeSink?: Function;

  constructor(params: {
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: Boolean;
  }) {
    super(params);
  }
}
