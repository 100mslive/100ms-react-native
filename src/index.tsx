import { requireNativeComponent, ViewStyle } from 'react-native';
import HmsManager from './classes/HMSSDK';
import HMSConfig from './classes/HMSConfig';
import HMSUpdateListenerActions from './classes/HMSUpdateListenerActions';
import HMSMessage from './classes/HMSMessage';

interface HmsViewProps {
  trackId: string;
  style: ViewStyle;
}

const HmsView = requireNativeComponent<HmsViewProps>('HmsView');

export { HMSConfig, HmsView, HMSUpdateListenerActions, HMSMessage };

export default HmsManager;
