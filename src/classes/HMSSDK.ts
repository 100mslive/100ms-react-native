import { NativeEventEmitter, NativeModules } from 'react-native';

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

const HmsManagerInstance = new NativeEventEmitter(HmsManager);

let HmsSdk: HMSManager | undefined;

export default class HMSManager {
  static async build() {
    console.log('here 222');
    if (HmsSdk) {
      return HmsSdk;
    }
    console.log('here 333');
    HmsSdk = new HMSManager();
    return HmsSdk;
  }

  static async addEventListener(action: string, callback: any) {
    await HmsManagerInstance.addListener(action, callback);
  }

  static async join(credentials: any) {
    await HmsManager.join(credentials);
  }

  static async getTrackIds(callback: any) {
    await HmsManager.getTrackIds(callback);
  }

  static async setLocalPeerMute(isMute: Boolean) {
    await HmsManager.setLocalMute(isMute);
  }

  static async setLocalPeerVideoMute(isMute: Boolean) {
    await HmsManager.setLocalVideoMute(isMute);
  }

  static async switchCamera() {
    await HmsManager.switchCamera();
  }
}
