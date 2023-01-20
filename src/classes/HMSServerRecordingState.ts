import type { HMSException } from './HMSException';

export class HMSServerRecordingState {
  running: boolean;
  error?: HMSException;
  startedAt?: Date;

  constructor(params: {
    running: boolean;
    error?: HMSException;
    startedAt?: Date;
  }) {
    this.running = params.running;
    this.error = params.error;
    this.startedAt = params.startedAt;
  }
}
