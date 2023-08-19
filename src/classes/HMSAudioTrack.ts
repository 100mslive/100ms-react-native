import { HMSTrack } from './HMSTrack';
import type { HMSTrackSource } from './HMSTrackSource'
import type { HMSTrackType } from './HMSTrackType';

export class HMSAudioTrack extends HMSTrack {
  constructor(params?: {
    trackId: string;
    source?: HMSTrackSource;
    trackDescription?: string;
    isMute?: boolean;
    id: string;
    type?: HMSTrackType;
  }) {
    if (params) {
      super(params);
    }
  }
}
