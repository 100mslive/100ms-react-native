import type { HMSPeer } from './HMSPeer';

export class HMSSpeaker {
  level: Number;
  peer: HMSPeer;
  trackId: string;

  constructor(params: { level: Number; peer: HMSPeer; trackId: string }) {
    this.level = params.level;
    this.peer = params.peer;
    this.trackId = params.trackId;
  }
}
