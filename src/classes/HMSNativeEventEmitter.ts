import { EventSubscription, NativeEventEmitter } from "react-native";
import { logger } from './HMSLogger';

export type HMSEventSubscription = {
  remove(): void;
};

export class HMSNativeEventEmitter {
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: any;

  constructor(nativeModule: any) {
    this._nativeModule = nativeModule;
    this._nativeEventEmitter = new NativeEventEmitter(nativeModule);
  }

  listenerCount(eventType: string): number {
    // For RN version < v0.64, listenerCount method is not available
    // @ts-ignore - typescript is giving error because we are running it with RN types version >= 0.64
    if (typeof this._nativeEventEmitter.listeners === 'function') {
      // @ts-ignore - typescript is giving error because we are running it with RN types version >= 0.64
      const count = this._nativeEventEmitter.listeners(eventType).length;

      logger?.verbose('#Function HMSNativeEventEmitter.listenerCount', { eventType, count });
      return count;
    }

    // For RN version >= v0.64
    const count = this._nativeEventEmitter.listenerCount(eventType);

    logger?.verbose('#Function HMSNativeEventEmitter.listenerCount', { eventType, count });
    return count;
  }

  addListener(id: string, eventType: string, listener: (...args: any[]) => any): HMSEventSubscription {
    logger?.verbose('#Function HMSNativeEventEmitter.addListener', { id, eventType, listener });

    // enable `eventType` on `HMSSDK`, if no listeners were added before
    // if some listeners were added before, then `eventType` on `HMSSDK` should already be enabled
    if (this.listenerCount(eventType) <= 0) {
      this.enableHMSEventType(id, eventType);
    }
    
    let subscription: EventSubscription | null = this._nativeEventEmitter.addListener(eventType, listener);

    return {
      remove: () => {
        console.log('#Function EventSubscription.remove', { id, eventType, listener });
        if (
          subscription &&
          Object.getOwnPropertyNames(subscription).includes('remove') &&
          typeof subscription.remove === 'function'
        ) {
          subscription.remove();
          subscription = null;
        } else {
          this._nativeEventEmitter.removeListener(eventType, listener);
        }

        // disable `eventType` on `HMSSDK`, if all listeners has been removed
        if (this.listenerCount(eventType) <= 0) {
          this.disableHMSEventType(id, eventType);
        }
      }
    };
  }

  removeAllListeners(id: string, eventType: string) {
    logger?.verbose('#Function HMSNativeEventEmitter.removeAllListeners', { id, eventType });

    // disable `eventType` on `HMSSDK`
    this.disableHMSEventType(id, eventType);

    return this._nativeEventEmitter.removeAllListeners(eventType);
  }

  private enableHMSEventType(id: string, eventType: string) {
    logger?.verbose('#Function HMSNativeEventEmitter.enableHMSEventType', { id, eventType });
    this._nativeModule.enableEvent({ id, eventType });
  }

  private disableHMSEventType(id: string, eventType: string) {
    logger?.verbose('#Function HMSNativeEventEmitter.disableHMSEventType', { id, eventType });
    this._nativeModule.disableEvent({ id, eventType });
  }
}
