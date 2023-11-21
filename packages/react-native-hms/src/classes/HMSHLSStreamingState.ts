import type { HMSHLSVariant } from './HMSHLSVariant';
import type { HMSException } from './HMSException';
import type { HMSStreamingState } from './HMSStreamingState';

export class HMSHLSStreamingState {
  running: boolean;
  startedAt?: Date;
  error?: HMSException;
  state: HMSStreamingState;
  variants?: Array<HMSHLSVariant>;

  constructor(params: {
    running: boolean;
    startedAt?: Date;
    error?: HMSException;
    state: HMSStreamingState;
    variants?: Array<HMSHLSVariant>
  }) {
    this.running = params.running;
    this.startedAt = params.startedAt;
    this.error = params.error;
    this.state = params.state;
    this.variants = params.variants;
  }
}
