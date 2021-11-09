import { HMSTrack } from './HMSTrack';

export class HMSVideoTrack extends HMSTrack {
  isDegraded?: boolean;
  addSink?: Function;
  removeSink?: Function;

  constructor(params: {
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: boolean;
    isDegraded?: boolean;
  }) {
    super(params);
    this.isDegraded = params.isDegraded;
  }
}
