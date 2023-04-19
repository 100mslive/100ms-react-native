import { NativeModules } from 'react-native';

const { HMSManager } = NativeModules;

export class HMSCameraControl {
  /**
   * It captures the image from the device camera at max possible resolution.
   * 
   * @param id [string] - HMSSDK id
   * @param flash [boolean] - value indicating whether to use flash to capture image or not
   * @returns [Promise] - which is resolved with the file path of the captured image saved on the disk
   */
  static captureImageAtMaxSupportedResolution(id: string, flash: boolean): Promise<string> {
    return HMSManager.captureImageAtMaxSupportedResolution({ id, flash });
  }
}
