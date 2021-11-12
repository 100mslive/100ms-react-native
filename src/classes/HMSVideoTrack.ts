import { HMSTrack } from './HMSTrack';
import type { HMSTrackType } from './HMSTrackType';

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
    type?: HMSTrackType;
  }) {
    super(params);
    this.isDegraded = params.isDegraded;
  }
}
