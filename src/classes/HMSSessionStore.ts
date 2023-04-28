import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { HMSConstants } from './HMSConstants';

const { HMSManager } = NativeModules;

export class HMSSessionStore {
  /**
   * Set a value for a specific key
   * @param {any} value 
   * @param {string} key 
   * @returns {Promise}
   */
  async set(value: any, key: string) {
    const data: { success: true, finalValue: any } = await HMSManager.setSessionMetadataForKey({ id: HMSConstants.DEFAULT_SDK_ID, key, value });
    return data;
  }

  /**
   * Retrieve the current value for a specific key once
   * @param {string} key
   * @returns {Promise}
   */
  async get(key: string) {
    const data = await HMSManager.getSessionMetadataForKey({ id: HMSConstants.DEFAULT_SDK_ID, key });
    return data;
  }

  addListener<T extends string[]>(
    forKeys: T,
    callback: (error: string | null, data: { key: T[number], value: any } | null) => void
  ) {
    // Unique Identifier for adding native event listener
    const uniqueId = forKeys.join('') + '_' +  Date.now().toString();

    const listener = (data: any) => {

      if (data.id !== HMSConstants.DEFAULT_SDK_ID) {
        return;
      }
      callback(null, data);
    }

    // Adding native event listener for the unique identifier
    let subscription: EmitterSubscription | null = DeviceEventEmitter.addListener(uniqueId, listener);

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

      HMSManager.removeKeyChangeListener({ id: HMSConstants.DEFAULT_SDK_ID, uniqueId });
    }

    HMSManager.addKeyChangeListener({ id: HMSConstants.DEFAULT_SDK_ID, keys: forKeys, uniqueId })
      .catch((err) => {
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
