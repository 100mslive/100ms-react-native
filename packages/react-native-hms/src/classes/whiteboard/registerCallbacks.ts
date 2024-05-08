import { HMSConstants } from '../HMSConstants';
import type { HMSEventSubscription } from '../HMSNativeEventEmitter';
import HMSNativeEventListener from '../HMSNativeEventListener';
import type { HMSWhiteboard } from './HMSWhiteboard';
import { HMSWhiteboardListenerActions } from './HMSWhiteboardListenerActions';
import type { HMSWhiteboardUpdateType } from './HMSWhiteboardUpdateType';

export type WhiteboardUpdateListener = (data: {
  hmsWhiteboard: HMSWhiteboard;
  updateType: HMSWhiteboardUpdateType;
}) => void;

let whiteboardUpdateSubscription: null | HMSEventSubscription = null;

export function registerWhiteboardUpdateListener(
  listener: WhiteboardUpdateListener
) {
  if (whiteboardUpdateSubscription !== null) {
    return;
  }
  whiteboardUpdateSubscription = HMSNativeEventListener.addListener(
    HMSConstants.DEFAULT_SDK_ID,
    HMSWhiteboardListenerActions.ON_WHITEBOARD_UPDATE,
    listener
  );
}

export function unregisterWhiteboardUpdateListener() {
  if (whiteboardUpdateSubscription === null) {
    return;
  }
  whiteboardUpdateSubscription.remove();
  whiteboardUpdateSubscription = null;
}
