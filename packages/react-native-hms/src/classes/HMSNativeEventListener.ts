import HMSManager from './HMSManagerModule';
import { HMSNativeEventEmitter } from './HMSNativeEventEmitter';

export type { HMSEventSubscription as HMSNativeEventSubscription } from './HMSNativeEventEmitter';

const HMSNativeEventListener = new HMSNativeEventEmitter(HMSManager);

export default HMSNativeEventListener;
