import type HMSAudioSettings from './HMSAudioSettings';
import type HMSSimulcastSettings from './HMSSimulcastSettings';
import type HMSStreamType from './HMSStreamType';
import type HMSVideoSettings from './HMSVideoSettings';

export default class HMSPublishSettings {
  audio: HMSAudioSettings;
  video: HMSVideoSettings;
  screen: HMSVideoSettings;
  audioSimulcast?: HMSSimulcastSettings;
  videoSimulcast?: HMSSimulcastSettings;
  screenSimulcast?: HMSSimulcastSettings;
  allowed?: [HMSStreamType];

  constructor(params: {
    audio: HMSAudioSettings;
    video: HMSVideoSettings;
    screen: HMSVideoSettings;
    audioSimulcast?: HMSSimulcastSettings;
    videoSimulcast?: HMSSimulcastSettings;
    screenSimulcast?: HMSSimulcastSettings;
    allowed?: [HMSStreamType];
  }) {
    this.audio = params.audio;
    this.video = params.video;
    this.screen = params.screen;
    this.audioSimulcast = params.audioSimulcast;
    this.videoSimulcast = params.videoSimulcast;
    this.screenSimulcast = params.screenSimulcast;
    this.allowed = params.allowed;
  }
}
