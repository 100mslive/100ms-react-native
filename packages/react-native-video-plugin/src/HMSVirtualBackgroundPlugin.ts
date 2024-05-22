// import { HMSConstants } from '../HMSConstants';
// import { logger } from '../HMSLogger';
import { Platform } from 'react-native';
import { HMSManagerModule } from '@100mslive/react-native-hms';
import { ReactNativeVideoPluginModule } from './modules/ReactNativeVideoPluginModule';

type HMSVirtualBackgroundPluginBackground = 'blur';

export class HMSVirtualBackgroundPlugin {
  background: HMSVirtualBackgroundPluginBackground;

  constructor(background: HMSVirtualBackgroundPluginBackground | any) {
    if (background === 'blur') {
      this.background = background;
    } else {
      const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');
      this.background = resolveAssetSource(background);
    }
  }

  /**
   * Enables video plugin.
   * @returns {Promise<boolean>} A promise that resolves to true when video plugin is enabled, otherwise, rejected promise is returned
   */
  async enable(): Promise<boolean> {
    // const data = { id: HMSConstants.DEFAULT_SDK_ID };
    const data = { id: '12345' };
    // logger?.verbose('#Function HMSVirtualBackgroundPlugin#enable', data);
    console.log('#Function HMSVirtualBackgroundPlugin#enable', data);

    try {
      let nativeModule =
        Platform.OS === 'android'
          ? ReactNativeVideoPluginModule
          : HMSManagerModule;
      return nativeModule.enableVideoPlugin(data);
    } catch (e) {
      // logger?.error(
      //   '#Error in #Function HMSVirtualBackgroundPlugin#enable ',
      //   e
      // );
      console.warn('#Error in #Function HMSVirtualBackgroundPlugin#enable ', e);
      return Promise.reject(e);
    }
  }

  /**
   * Disable video plugin.
   * @returns {Promise<boolean>} A promise that resolves to true when video plugin is disabled, otherwise, rejected promise is returned
   */
  async disable(): Promise<boolean> {
    // const data = { id: HMSConstants.DEFAULT_SDK_ID };
    const data = { id: '12345' };
    // logger?.verbose('#Function HMSVirtualBackgroundPlugin#disable', data);
    console.log('#Function HMSVirtualBackgroundPlugin#disable', data);

    try {
      let nativeModule =
        Platform.OS === 'android'
          ? ReactNativeVideoPluginModule
          : HMSManagerModule;
      return nativeModule.disableVideoPlugin(data);
    } catch (e) {
      // logger?.error(
      //   '#Error in #Function HMSVirtualBackgroundPlugin#disable ',
      //   e
      // );
      console.warn(
        '#Error in #Function HMSVirtualBackgroundPlugin#disable ',
        e
      );
      return Promise.reject(e);
    }
  }
}
