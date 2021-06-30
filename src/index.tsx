import {
  NativeModules,
  NativeEventEmitter,
  requireNativeComponent,
  ViewStyle,
} from 'react-native';

const HmsManager = NativeModules.HmsManager;

const HmsManagerInstance = new NativeEventEmitter(HmsManager);

export const addEventListener = (callback: any) =>
  HmsManagerInstance.addListener('ON_JOIN', callback);

interface HmsViewProps {
  trackId: string;
  style: ViewStyle;
}

export const HmsView = requireNativeComponent<HmsViewProps>('HmsView');

export default HmsManager;
