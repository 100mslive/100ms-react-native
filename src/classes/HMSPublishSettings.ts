import type { HMSAudioSettings } from './HMSAudioSettings';
import type { HMSSimulcastSettings } from './HMSSimulcastSettings';
import type { HMSVideoSettings } from './HMSVideoSettings';

export class HMSPublishSettings {
  audio: HMSAudioSettings;
  video: HMSVideoSettings;
  screen: HMSVideoSettings;
  allowed?: [string];

  constructor(params: {
    audio: HMSAudioSettings;
    video: HMSVideoSettings;
    screen: HMSVideoSettings;
    allowed?: [string];
  }) {
    this.audio = params.audio;
    this.video = params.video;
    this.screen = params.screen;
    this.allowed = params.allowed;
  }
}
