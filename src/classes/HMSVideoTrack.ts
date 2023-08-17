import { HMSTrack } from './HMSTrack';
import type { HMSTrackSource } from './HMSTrackSource'
import type { HMSTrackType } from './HMSTrackType';

export class HMSVideoTrack extends HMSTrack {
  isDegraded?: boolean;

  constructor(params: {
    trackId: string;
    source?: HMSTrackSource;
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
