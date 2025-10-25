import { DeviceEventEmitter } from 'react-native';
import type { EmitterSubscription as RNEmitterSubscription } from 'react-native';

import HMSManager from '../modules/HMSManagerModule';

import { HMSConstants } from './HMSConstants';
import { getLogger } from './HMSLogger';
import { HMSUpdateListenerActions } from './HMSUpdateListenerActions';
import { EventEmitter } from '../utils';
import type { EmitterSubscription } from '../utils';

export type JsonPrimitive = string | number | boolean | null;
export type JsonMap = {
  [key: string]: JsonPrimitive | JsonMap | JsonArray;
};
export type JsonArray = Array<JsonPrimitive | JsonMap | JsonArray>;
export type JsonValue = JsonPrimitive | JsonMap | JsonArray;

/**
 * Session store is a shared realtime key-value store that is accessible by all Peers in a Room.
 * It can be utilized to implement features such as pinned text, spotlight (which brings a particular
 * peer to the center stage for everyone in the room) and more, enhancing interactive experiences.
 *
 * To get an instance of `HMSSessionStore` class, You can add an event listener for `ON_SESSION_STORE_AVAILABLE`
 * event on the `HMSSDK` instance
 *
 * For example:
 * ```
 * hmsInstance.addEventListener(HMSUpdateListenerActions.ON_SESSION_STORE_AVAILABLE, <your callback function>);
 * ```
 *
 * Checkout Session Store docs fore more details ${@link https://www.100ms.live/docs/react-native/v2/how-to-guides/interact-with-room/room/session-store}
 */
export class HMSSessionStore {
  private _deviceEventEmitterSubscription?: RNEmitterSubscription;
  private _eventEmitter?: EventEmitter;
  private _addedKeyChangeListenerCount = 0;

  /**
   * This method sets a value for a specific key on session store.
   * Once a value is assigned, it will be available for other peers in the room
   * who are listening for changes in value for that specific key.
   *
   * @param {JsonValue} value - The value to set, which can be any JSON-compatible type.
   * @param {string} key - The key under which to store the value.
   * @returns {Promise} A promise that resolves when the operation is complete.
   */
  async set(value: JsonValue, key: string) {
    const data: { success: true } = await HMSManager.setSessionMetadataForKey({
      id: HMSConstants.DEFAULT_SDK_ID,
      key,
      value,
    });
    return data;
  }

  /**
   * Retrieves the value for a given key from the session store. This method does not subscribe
   * to changes; it only returns the current value at the time of the call.
   *
   * To listen to value change updates use `addKeyChangeListener` method instead.
   *
   * @param {string} key - The key whose value is to be retrieved.
   * @returns {Promise} A promise that resolves with the value of the key.
   */
  async get(key: string) {
    const data: JsonValue = await HMSManager.getSessionMetadataForKey({
      id: HMSConstants.DEFAULT_SDK_ID,
      key,
    });
    return data;
  }

  /**
   * Registers a callback to listen for changes to specified keys in the session store.
   * The callback is called with the initial value and again whenever any value changes.
   *
   * @param {string[]} forKeys - An array of keys to listen for changes on.
   * @param {Function} callback - The function to call when a value changes.
   * @returns {Object} An object with a `remove` method to unregister the listener.
   */
  addKeyChangeListener<T extends string[]>(
    forKeys: T,
    callback: (
      error: string | null,
      data: { key: T[number]; value: JsonValue } | null
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

  private _cleanup(subscriptionsToRemove: EmitterSubscription[]) {
    // Extracting `uniqueId` from first subscription (all subscriptions have same uniqueId)
    // this `uniqueId` will be used to remove 'KeyChangeListener' from native side
    const uniqueId =
      subscriptionsToRemove.length > 0
        ? (subscriptionsToRemove[0]!.context as { uniqueId: string }).uniqueId
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
      if (this._deviceEventEmitterSubscription) {
        this._deviceEventEmitterSubscription.remove();
      }

      this._deviceEventEmitterSubscription = undefined;

      this._eventEmitter = undefined;
    }
  }

  private _deviceEventEmitterListener(data: {
    id: string;
    key: string;
    value: JsonValue;
  }) {
    // if id is different from default sdk_id, return early
    if (data.id !== HMSConstants.DEFAULT_SDK_ID) {
      return;
    }

    // emit event for the key
    getLogger()?.verbose('#Listener ON_SESSION_STORE_CHANGED event: ', data);

    this._eventEmitter?.emit(data.key, null, data);
  }
}
