import type { HMSPeer } from './HMSPeer';

export class HMSChangeTrackStateRequest {
  requestedBy: HMSPeer;
  trackType: string;

  constructor(params: { requestedBy: HMSPeer; trackType: string }) {
    this.requestedBy = params.requestedBy;
    this.trackType = params.trackType;
  }
}
