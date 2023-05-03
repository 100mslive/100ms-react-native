import {
  NativeModules,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
import { HMSConstants } from './HMSConstants';
import { getLogger } from './HMSLogger';

const { HMSManager } = NativeModules;

type Nullable<T> = T | null | undefined;

export class HMSSessionStore {
  /**
   * Set a value for a specific key
   * @param {Nullable<string>} value
   * @param {string} key
   * @returns {Promise}
   */
  async set(value: Nullable<string>, key: string) {
    const data: { success: true; finalValue: Nullable<string> } =
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
    const data: Nullable<string> = await HMSManager.getSessionMetadataForKey({
      id: HMSConstants.DEFAULT_SDK_ID,
      key,
    });
    return data;
  }

  addKeyChangeListener<T extends string[]>(
    forKeys: T,
    callback: (
      error: string | null,
      data: { key: T[number]; value: Nullable<string> } | null
    ) => void
  ) {
    // Unique Identifier for adding native event listener
    const uniqueId = forKeys.join('') + '_' + Date.now().toString();

    const listener = (data: any) => {
      if (data.id !== HMSConstants.DEFAULT_SDK_ID) {
        return;
      }
      callback(null, data);
    };

    // Adding native event listener for the unique identifier
    let subscription: EmitterSubscription | null =
      DeviceEventEmitter.addListener(uniqueId, listener);

    let handleRemove: (() => void) | null = () => {
      if (
        subscription &&
        Object.getOwnPropertyNames(subscription).includes('remove') &&
        typeof subscription.remove === 'function'
      ) {
        subscription.remove();
        subscription = null;
      } else {
        DeviceEventEmitter.removeListener(uniqueId, listener);
      }

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
    };

    HMSManager.addKeyChangeListener({
      id: HMSConstants.DEFAULT_SDK_ID,
      keys: forKeys,
      uniqueId,
    }).catch((err: any) => {
      if (typeof handleRemove === 'function') {
        callback(err, null);
        handleRemove();
        handleRemove = null;
      }
    });

    return {
      remove: () => {
        if (typeof handleRemove === 'function') {
          handleRemove();
          handleRemove = null;
        }
      },
    };
  }
}
