import type { HMSTrack } from './HMSTrack';
import type { HMSPeer } from './HMSPeer';

export class HMSSpeaker {
  level: Number;
  peer: HMSPeer;
  track: HMSTrack;

  constructor(params: { level: Number; peer: HMSPeer; track: HMSTrack }) {
    this.level = params.level;
    this.peer = params.peer;
    this.track = params.track;
  }
}
