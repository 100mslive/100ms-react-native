import { requireNativeComponent, ViewStyle } from 'react-native';
import HmsManager from './classes/HMSSDK';

interface HmsViewProps {
  trackId: string;
  style: ViewStyle;
}

export const HmsView = requireNativeComponent<HmsViewProps>('HmsView');

export default HmsManager;
