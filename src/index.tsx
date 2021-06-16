import { requireNativeComponent, ViewStyle } from 'react-native';

type HmssdkProps = {
  color: string;
  style: ViewStyle;
};

export const HmssdkViewManager = requireNativeComponent<HmssdkProps>(
'HmssdkView'
);

export default HmssdkViewManager;
