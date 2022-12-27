import type { HMSSimulcastSettingsPolicy } from './HMSSimulcastSettingsPolicy';

export class HMSSimulcastSettings {
  video?: HMSSimulcastSettingsPolicy;

  screen?: HMSSimulcastSettingsPolicy;

  constructor(params: {
    video?: HMSSimulcastSettingsPolicy;
    screen?: HMSSimulcastSettingsPolicy;
  }) {
    this.video = params.video;
    this.screen = params.screen;
  }
}
