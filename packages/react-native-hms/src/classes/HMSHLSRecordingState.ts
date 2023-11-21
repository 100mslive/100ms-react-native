import type { HMSException } from './HMSException';
import type { HMSRecordingState } from './HMSRecordingState';

export class HMSHLSRecordingState {
  initialising: boolean;
  running: boolean;
  error?: HMSException;
  startedAt?: Date;
  state: HMSRecordingState;
  constructor(params: {
    initialising: boolean;
    running: boolean;
    startedAt?: Date;
    error?: HMSException;
    state: HMSRecordingState;
  }) {
    this.initialising = params.initialising;
    this.running = params.running;
    this.startedAt = params.startedAt;
    this.error = params.error;
    this.state = params.state;
  }
}
