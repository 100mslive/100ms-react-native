import { Platform } from 'react-native';

import HMSManager from '../modules/HMSManagerModule';

export class WindowController {
  /**
   * [Android Only] Hides the navigation bar.
   */
  static hideNavigationBar() {
    if (Platform.OS === 'android') {
      return HMSManager.hideNavigationBar();
    }
  }

  /**
   * [Android Only] Shows the navigation bar.
   */
  static showNavigationBar() {
    if (Platform.OS === 'android') {
      return HMSManager.showNavigationBar();
    }
  }
}
