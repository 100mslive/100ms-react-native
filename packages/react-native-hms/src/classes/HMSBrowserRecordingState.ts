import type { HMSException } from './HMSException';
import type { HMSRecordingState } from './HMSRecordingState';

export class HMSBrowserRecordingState {
  initialising: boolean;
  running: boolean;
  error?: HMSException;
  startedAt?: Date;
  stoppedAt?: Date;
  state: HMSRecordingState;

  constructor(params: {
    initialising: boolean;
    running: boolean;
    error?: HMSException;
    startedAt?: Date;
    stoppedAt?: Date;
    state: HMSRecordingState;
  }) {
    this.initialising = params.initialising;
    this.running = params.running;
    this.error = params.error;
    this.startedAt = params.startedAt;
    this.stoppedAt = params.stoppedAt;
    this.state = params.state;
  }
}
