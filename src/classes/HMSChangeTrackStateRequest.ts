import type { HMSPeer } from './HMSPeer';

export class HMSChangeTrackStateRequest {
  requestedBy: HMSPeer;
  trackType: string;
  mute: boolean;

  constructor(params: {
    requestedBy: HMSPeer;
    trackType: string;
    mute: boolean;
  }) {
    this.requestedBy = params.requestedBy;
    this.trackType = params.trackType;
    this.mute = params.mute;
  }
}
