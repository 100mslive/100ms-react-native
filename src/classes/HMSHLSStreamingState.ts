import type { HMSHLSVariant } from './HMSHLSVariant';

export class HMSHLSStreamingState {
  running: boolean;
  variants: Array<HMSHLSVariant>;

  constructor(params: { running: boolean; variants: Array<HMSHLSVariant> }) {
    this.running = params.running;
    this.variants = params.variants;
  }
}
