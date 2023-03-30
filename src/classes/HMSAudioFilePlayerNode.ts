import { NativeModules } from 'react-native';
import { HMSAudioNode } from './HMSAudioNode';

const {
  /**
   * @ignore
   */
  HMSManager,
} = NativeModules;

export class HMSAudioFilePlayerNode extends HMSAudioNode {
  constructor(name: string) {
    super(name);
  }

  setVolume(volume: number) {
    HMSManager.setAudioShareVolume({
      id: this.sdkId,
      audioNode: this.name,
      volume,
    });
  }

  async play(fileUrl: string, loops?: boolean, interrupts?: boolean) {
    return await HMSManager.playAudioShare({
      id: this.sdkId,
      audioNode: this.name,
      fileUrl,
      loops,
      interrupts,
    });
  }

  pause() {
    HMSManager.pauseAudioShare({
      id: this.sdkId,
      audioNode: this.name,
    });
  }

  resume() {
    HMSManager.resumeAudioShare({
      id: this.sdkId,
      audioNode: this.name,
    });
  }

  stop() {
    HMSManager.stopAudioShare({
      id: this.sdkId,
      audioNode: this.name,
    });
  }

  async isPlaying() {
    return await HMSManager.audioShareIsPlaying({
      id: this.sdkId,
      audioNode: this.name,
    });
  }

  async currentDuration() {
    return await HMSManager.audioShareCurrentTime({
      id: this.sdkId,
      audioNode: this.name,
    });
  }

  async duration() {
    return await HMSManager.audioShareDuration({
      id: this.sdkId,
      audioNode: this.name,
    });
  }
}
