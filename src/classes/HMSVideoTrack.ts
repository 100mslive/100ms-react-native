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
    id: string;
    isDegraded?: boolean;
  }) {
    super(params);
    this.isDegraded = params.isDegraded;
  }
}
