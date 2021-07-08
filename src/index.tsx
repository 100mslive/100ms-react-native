import { requireNativeComponent, ViewStyle } from 'react-native';
import HmsManager from './classes/HMSSDK';
import HMSConfig from './classes/HMSConfig';

interface HmsViewProps {
  trackId: string;
  style: ViewStyle;
}

const HmsView = requireNativeComponent<HmsViewProps>('HmsView');

export { HMSConfig, HmsView };

export default HmsManager;
