import { Platform } from 'react-native';

import HMSManager from '../modules/HMSManagerModule';

export class WindowController {
  /**
   * [Android Only] Hides the navigation bar.
   */
  static hideSystemBars() {
    if (Platform.OS === 'android') {
      return HMSManager.hideSystemBars();
    }
  }

  /**
   * [Android Only] Shows the navigation bar.
   */
  static showSystemBars() {
    if (Platform.OS === 'android') {
      return HMSManager.showSystemBars();
    }
  }
}
