import { requireNativeComponent, ViewStyle } from 'react-native';

type HmssdkProps = {
  color: string;
  style: ViewStyle;
  credentials: { authToken: string; userId: string; roomId: string };
  layout: { width: number; height: number };
  isMute: boolean;
  switchCamera: boolean;
  muteVideo: boolean;
};

export const HmssdkViewManager =
  requireNativeComponent<HmssdkProps>('HmssdkView');

export default HmssdkViewManager;
