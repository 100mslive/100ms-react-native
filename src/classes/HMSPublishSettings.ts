import type { HMSAudioSettings } from './HMSAudioSettings';
import type { HMSVideoSettings } from './HMSVideoSettings';
import type { HMSSimulcastSettings } from './HMSSimulcastSettings';

export class HMSPublishSettings {
  audio: HMSAudioSettings;
  video: HMSVideoSettings;
  screen: HMSVideoSettings;
  allowed?: [string];
  simulcast?: HMSSimulcastSettings;

  constructor(params: {
    audio: HMSAudioSettings;
    video: HMSVideoSettings;
    screen: HMSVideoSettings;
    allowed?: [string];
    simulcast?: HMSSimulcastSettings;
  }) {
    this.audio = params.audio;
    this.video = params.video;
    this.screen = params.screen;
    this.allowed = params.allowed;
    this.simulcast = params.simulcast;
  }
}
