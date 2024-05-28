import { Platform } from 'react-native';
import { HMSManagerModule } from '@100mslive/react-native-hms';

import { ReactNativeVideoPluginModule } from './modules/ReactNativeVideoPluginModule';

const _nativeModule =
  Platform.OS === 'android' ? ReactNativeVideoPluginModule : HMSManagerModule;

export class HMSVideoPlugin {
  protected type: string;

  constructor(pluginType: string) {
    this.type = pluginType;
  }

  protected get nativeModule() {
    return _nativeModule;
  }

  /**
   * Enables video plugin.
   * @returns {Promise<boolean>} A promise that resolves to true when video plugin is enabled, otherwise, rejected promise is returned
   */
  async enable(): Promise<boolean> {
    const data = { id: '12345', type: this.type };
    if (__DEV__)
      console.log('#Function HMSVirtualBackgroundPlugin#enable', data);

    try {
      return this.nativeModule.enableVideoPlugin(data);
    } catch (e) {
      if (__DEV__)
        console.warn(
          '#Error in #Function HMSVirtualBackgroundPlugin#enable ',
          e
        );
      return Promise.reject(e);
    }
  }

  /**
   * Disable video plugin.
   * @returns {Promise<boolean>} A promise that resolves to true when video plugin is disabled, otherwise, rejected promise is returned
   */
  async disable(): Promise<boolean> {
    const data = { id: '12345', type: this.type };
    if (__DEV__)
      console.log('#Function HMSVirtualBackgroundPlugin#disable', data);

    try {
      return this.nativeModule.disableVideoPlugin(data);
    } catch (e) {
      if (__DEV__)
        console.warn(
          '#Error in #Function HMSVirtualBackgroundPlugin#disable ',
          e
        );
      return Promise.reject(e);
    }
  }
}
