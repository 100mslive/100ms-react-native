import { HMSTrack } from './HMSTrack';

export class HMSAudioTrack extends HMSTrack {
  constructor(params?: {
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: boolean;
  }) {
    if (params) {
      super(params);
    }
  }
}
