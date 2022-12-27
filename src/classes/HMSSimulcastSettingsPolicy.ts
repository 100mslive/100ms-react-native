import type { HMSSimulcastLayerSettingsPolicy } from './HMSSimulcastLayerSettingsPolicy';
export class HMSSimulcastSettingsPolicy {
  layers?: [HMSSimulcastLayerSettingsPolicy];

  constructor(params: { layers?: [HMSSimulcastLayerSettingsPolicy] }) {
    this.layers = params.layers;
  }
}
