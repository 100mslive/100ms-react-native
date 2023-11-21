import type { HMSException } from './HMSException';
import type { HMSRecordingState } from './HMSRecordingState';

export class HMSServerRecordingState {
  initialising: boolean;
  running: boolean;
  error?: HMSException;
  startedAt?: Date;
  state: HMSRecordingState;

  constructor(params: {
    initialising: boolean;
    running: boolean;
    error?: HMSException;
    startedAt?: Date;
    state: HMSRecordingState;
  }) {
    this.initialising = params.initialising;
    this.running = params.running;
    this.error = params.error;
    this.startedAt = params.startedAt;
    this.state = params.state;
  }
}
