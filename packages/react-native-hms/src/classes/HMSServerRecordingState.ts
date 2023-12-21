import type { HMSException } from './HMSException';
import type { HMSRecordingState } from './HMSRecordingState';

export class HMSServerRecordingState {
  running: boolean;
  error?: HMSException;
  startedAt?: Date;
  state: HMSRecordingState;

  constructor(params: {
    running: boolean;
    error?: HMSException;
    startedAt?: Date;
    state: HMSRecordingState;
  }) {
    this.running = params.running;
    this.error = params.error;
    this.startedAt = params.startedAt;
    this.state = params.state;
  }
}
