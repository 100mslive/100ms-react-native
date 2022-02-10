import type { HMSException } from './HMSException';

export class HMSServerRecordingState {
  running: string;
  error: HMSException;
  startedAt: number;

  constructor(params: {
    running: string;
    error: HMSException;
    startedAt: number;
  }) {
    this.running = params.running;
    this.error = params.error;
    this.startedAt = params.startedAt;
  }
}
