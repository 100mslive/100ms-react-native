import {
  NativeModules,
  DeviceEventEmitter,
  EmitterSubscription as RNEmitterSubscription,
} from 'react-native';
import { HMSConstants } from './HMSConstants';
import { getLogger } from './HMSLogger';
import { HMSUpdateListenerActions } from './HMSUpdateListenerActions';
import { EventEmitter } from '../utils';
import type { EmitterSubscription } from '../utils';

const { HMSManager } = NativeModules;

type Nullable<T> = T | null | undefined;

export type HMSSessionStoreValue = Nullable<string>;

export class HMSSessionStore {
  private _deviceEventEmitterSubscription?: RNEmitterSubscription;
  private _eventEmitter?: EventEmitter;
  private _addedKeyChangeListenerCount = 0;

  /**
   * Set a value for a specific key
   * @param {HMSSessionStoreValue} value
   * @param {string} key
   * @returns {Promise}
   */
  async set(value: HMSSessionStoreValue, key: string) {
    const data: { success: true; finalValue: HMSSessionStoreValue } =
      await HMSManager.setSessionMetadataForKey({
        id: HMSConstants.DEFAULT_SDK_ID,
        key,
        value,
      });
    return data;
  }

  /**
   * Retrieve the current value for a specific key once
   * @param {string} key
   * @returns {Promise}
   */
  async get(key: string) {
    const data: HMSSessionStoreValue =
      await HMSManager.getSessionMetadataForKey({
        id: HMSConstants.DEFAULT_SDK_ID,
        key,
      });
    return data;
  }

  private _cleanup(subscriptionsToRemove: EmitterSubscription[]) {
    // Extracting `uniqueId` from first subscription (all subscriptions have same uniqueId)
    // this `uniqueId` will be used to remove 'KeyChangeListener' from native side
    const uniqueId =
      subscriptionsToRemove.length > 0
        ? (subscriptionsToRemove[0].context as { uniqueId: string }).uniqueId
        : null;

    // Removing required subscriptions from 'eventEmitter'
    subscriptionsToRemove.forEach((subscription) => subscription.remove());

    // Removing 'KeyChangeListener' from native side
    HMSManager.removeKeyChangeListener({
      id: HMSConstants.DEFAULT_SDK_ID,
      uniqueId,
    }).catch((error: any) => {
      const logger = getLogger();
      logger?.verbose(
        "Error while removing key change listener, Listener didn't get registerred at first place or was already removed",
        error
      );
    });

    this._addedKeyChangeListenerCount -= 1;

    if (this._addedKeyChangeListenerCount <= 0) {
      this._addedKeyChangeListenerCount = 0;
      if (
        this._deviceEventEmitterSubscription &&
        Object.getOwnPropertyNames(
          this._deviceEventEmitterSubscription
        ).includes('remove') &&
        typeof this._deviceEventEmitterSubscription.remove === 'function'
      ) {
        this._deviceEventEmitterSubscription.remove();
      } else {
        DeviceEventEmitter.removeListener(
          HMSUpdateListenerActions.ON_SESSION_STORE_CHANGED,
          this._deviceEventEmitterListener
        );
      }

      this._deviceEventEmitterSubscription = undefined;

      this._eventEmitter = undefined;
    }
  }

  private _deviceEventEmitterListener(data: {
    id: string;
    key: string;
    value: HMSSessionStoreValue;
  }) {
    // if id is different from default sdk_id, return early
    if (data.id !== HMSConstants.DEFAULT_SDK_ID) {
      return;
    }

    // emit event for the key
    getLogger()?.verbose('#Listener ON_SESSION_STORE_CHANGED event: ', data);

    this._eventEmitter?.emit(data.key, null, data);
  }

  addKeyChangeListener<T extends string[]>(
    forKeys: T,
    callback: (
      error: string | null,
      data: { key: T[number]; value: HMSSessionStoreValue } | null
    ) => void
  ) {
    // Add Native Device Event Emitter if it is not already added
    if (!this._deviceEventEmitterSubscription) {
      this._deviceEventEmitterSubscription = DeviceEventEmitter.addListener(
        HMSUpdateListenerActions.ON_SESSION_STORE_CHANGED,
        this._deviceEventEmitterListener.bind(this)
      );
    }

    // Create JS side EventEmitter
    if (!this._eventEmitter) {
      this._eventEmitter = new EventEmitter();
    }

    // Unique Identifier for adding native event listener
    const uniqueId = forKeys.join('') + '_' + Date.now().toString();

    const eventEmitter = this._eventEmitter;

    // Add listeners on eventEmitter for each key
    const subscriptions = forKeys.map((key) =>
      eventEmitter.addListener(key, callback, { uniqueId })
    );

    //
    let cleanupHandler: (() => void) | null = () => {
      this._cleanup(subscriptions);
    };

    // Adding 'KeyChangeListener' on native side
    HMSManager.addKeyChangeListener({
      id: HMSConstants.DEFAULT_SDK_ID,
      keys: forKeys,
      uniqueId,
    })
      // Adding 'KeyChangeListener' fails on native side
      .catch((err: any) => {
        if (typeof cleanupHandler === 'function') {
          callback(err, null);
          cleanupHandler();
          cleanupHandler = null;
        }
      });

    this._addedKeyChangeListenerCount += 1;

    return {
      remove: () => {
        if (typeof cleanupHandler === 'function') {
          cleanupHandler();
          cleanupHandler = null;
        }
      },
    };
  }
}
