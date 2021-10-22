import type { HMSSpeaker } from './HMSSpeaker';

export class HMSSpeakerUpdate {
  event?: string;
  count?: Number;
  peers?: Array<HMSSpeaker>;

  constructor(params: {
    event?: string;
    count?: Number;
    peers?: Array<HMSSpeaker>;
  }) {
    this.event = params.event;
    this.count = params.count;
    this.peers = params.peers;
  }
}
