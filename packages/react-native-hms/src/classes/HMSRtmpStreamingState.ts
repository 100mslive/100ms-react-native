import type { HMSException } from './HMSException';
import type { HMSStreamingState } from './HMSStreamingState';

export class HMSRtmpStreamingState {
  running: boolean;
  error?: HMSException;
  startedAt?: Date;
  state: HMSStreamingState;

  constructor(params: {
    running: boolean;
    error?: HMSException;
    startedAt?: Date;
    state: HMSStreamingState;
  }) {
    this.running = params.running;
    this.error = params.error;
    this.startedAt = params.startedAt;
    this.state = params.state;
  }
}
