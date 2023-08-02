import type { HMSException } from './HMSException';

export class HMSBrowserRecordingState {

  initialising: boolean;
  running: boolean;
  error?: HMSException;
  startedAt?: Date;
  stoppedAt?: Date;

  constructor(params: {
    initialising: boolean;
    running: boolean;
    error?: HMSException;
    startedAt?: Date;
    stoppedAt?: Date;
  }) {
    this.initialising = params.initialising;
    this.running = params.running;
    this.error = params.error;
    this.startedAt = params.startedAt;
    this.stoppedAt = params.stoppedAt;
  }
}
