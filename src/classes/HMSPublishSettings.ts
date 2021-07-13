import type HMSSimulcastSettings from './HMSSimulcastSettings';
import type HMSVideoSettings from './HMSVideoSettings';

export default class HMSPublishSettings {
  audio: string;
  video: HMSVideoSettings;
  screen: HMSVideoSettings;
  audioSimulcast?: HMSSimulcastSettings;
  videoSimulcast?: HMSSimulcastSettings;
  screenSimulcast?: HMSSimulcastSettings;

  constructor(params: {
    audio: string;
    video: HMSVideoSettings;
    screen: HMSVideoSettings;
    audioSimulcast?: HMSSimulcastSettings;
    videoSimulcast?: HMSSimulcastSettings;
    screenSimulcast?: HMSSimulcastSettings;
  }) {
    this.audio = params.audio;
    this.video = params.video;
    this.screen = params.screen;
    this.audioSimulcast = params.audioSimulcast;
    this.videoSimulcast = params.videoSimulcast;
    this.screenSimulcast = params.screenSimulcast;
  }
}
