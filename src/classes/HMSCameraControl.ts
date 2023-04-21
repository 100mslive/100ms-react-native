import { NativeModules } from 'react-native';
import { HMSConstants } from './HMSConstants';

const { HMSManager } = NativeModules;

export class HMSCameraControl {
  /**
   * It captures the image from the device camera at max possible resolution.
   *
   * @param {boolean} [flash=false] flash - value indicating whether to use flash while capturing image or not
   * @returns Promise - which is resolved with the file path of the captured image saved on the disk
   */
  static captureImageAtMaxSupportedResolution(
    flash: boolean = false
  ): Promise<string> {
    return HMSManager.captureImageAtMaxSupportedResolution({
      id: HMSConstants.DEFAULT_SDK_ID,
      flash,
    });
  }
}
