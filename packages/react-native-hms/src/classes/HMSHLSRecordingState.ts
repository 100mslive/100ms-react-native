import type { HMSException } from './HMSException';
import type { HMSRecordingState } from './HMSRecordingState';

export class HMSHLSRecordingState {
  running: boolean;
  error?: HMSException;
  startedAt?: Date;
  state: HMSRecordingState;
  constructor(params: {
    running: boolean;
    startedAt?: Date;
    error?: HMSException;
    state: HMSRecordingState;
  }) {
    this.running = params.running;
    this.startedAt = params.startedAt;
    this.error = params.error;
    this.state = params.state;
  }
}
