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
    const data: { success: true, finalValue: any } = await HMSManager.setKVOnSessionStore({ id: HMSConstants.DEFAULT_SDK_ID, key, value });
    return data;
  }

  /**
   * Retrieve the current value for a specific key once
   * @param {string} key 
   * @returns {Promise}
   */
  async object(key: string) {
    const data = await HMSManager.getVFromSessionStore({ id: HMSConstants.DEFAULT_SDK_ID, key });
    return data;
  }

  observeChanges(keys: string[], callback: (data: { id: string; data: [key: string, value: any]; error: string | null }) => void) {
    let t: null | EmitterSubscription = DeviceEventEmitter.addListener('xyz', () => {});

    return {
      remove: () => {
        console.log(t, t?.key);
        // call remove on t;
        t?.remove();
        
        // remove observer from native side
        HMSManager.removeSessionStoreObserver(t?.key);

        t = null;
      }
    }
  }
}
