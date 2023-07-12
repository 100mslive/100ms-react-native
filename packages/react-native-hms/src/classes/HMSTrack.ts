import type { HMSTrackType } from './HMSTrackType';

export class HMSTrack {
  trackId: string;
  source?: number | string;
  trackDescription?: string;
  mute?: boolean;
  id: string;
  type?: HMSTrackType;

  isMute = () => {
    return this.mute;
  };

  constructor(params: {
    trackId: string;
    source?: number | string;
    trackDescription?: string;
    isMute?: boolean;
    id: string;
    type?: HMSTrackType;
  }) {
    this.trackId = params.trackId;
    this.source = params.source;
    this.trackDescription = params.trackDescription;
    this.mute = params.isMute;
    this.id = params.id;
    this.type = params.type;
  }
}
