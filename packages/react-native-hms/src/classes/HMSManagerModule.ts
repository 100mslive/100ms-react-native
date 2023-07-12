import { NativeModules } from 'react-native';

const { HMSManager } = NativeModules;

if (HMSManager == null) {
  console.error(
    `[@100mslive/react-native-hms] react-native-hms module was not found. Make sure you're running your app on the native platform and your code is linked properly (cd ios && pod install && cd ..).

    For installation instructions, please refer to https://www.100ms.live/docs/react-native/v2/how-to-guides/install-the-sdk/integration`
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
  );
}

export type HMSManagerProps = any;

export default HMSManager as HMSManagerProps;
