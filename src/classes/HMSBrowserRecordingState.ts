import type { HMSException } from './HMSException';

export class HMSBrowserRecordingState {
  running: string;
  error: HMSException;
  startedAt: number;
  stoppedAt: number;

  constructor(params: {
    running: string;
    error: HMSException;
    startedAt: number;
    stoppedAt: number;
  }) {
    this.running = params.running;
    this.error = params.error;
    this.startedAt = params.startedAt;
    this.stoppedAt = params.stoppedAt;
  }
}
