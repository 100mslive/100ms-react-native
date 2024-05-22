import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@100mslive/react-native-video-plugin' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export const ReactNativeVideoPluginModule = NativeModules.ReactNativeVideoPlugin
  ? NativeModules.ReactNativeVideoPlugin
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );
