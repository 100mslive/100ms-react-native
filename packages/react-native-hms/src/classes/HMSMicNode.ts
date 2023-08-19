import { NativeModules } from 'react-native';
import { HMSAudioNode } from './HMSAudioNode';

const {
  /**
   * @ignore
   */
  HMSManager,
} = NativeModules;

export class HMSMicNode extends HMSAudioNode {
  constructor() {
    super('mic_node');
  }

  setVolume(volume: number) {
    return HMSManager.setAudioShareVolume({
      id: this.sdkId,
      audioNode: this.name,
      volume,
    });
  }
}
