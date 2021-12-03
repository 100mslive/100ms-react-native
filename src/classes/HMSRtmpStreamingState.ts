import type { HMSException } from './HMSException';

export class HMSRtmpStreamingState {
  running: string;
  error: HMSException;

  constructor(params: { running: string; error: HMSException }) {
    this.running = params.running;
    this.error = params.error;
  }
}
