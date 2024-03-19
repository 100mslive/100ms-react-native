import HMSManagerModule from '../modules/HMSManagerModule';
import { HMSConstants } from './HMSConstants';
import { logger } from './HMSLogger';

let _isNCAvailable: { current: boolean | null } = { current: null };

/**
 * Class representing an HMS Noise Cancellation Plugin.
 */
export class HMSNoiseCancellationPlugin {
  modelName: HMSNoiseCancellationModels;
  initialState: HMSNoiseCancellationInitialState;

  /**
   * Creates an instance of HMSNoiseCancellationPlugin.
   * @param {Object} [config] - The configuration options.
   * @param {HMSNoiseCancellationModels} [config.modelName] - The model name for noise cancellation.
   * @param {HMSNoiseCancellationInitialState} [config.initialState] - The initial state for noise cancellation.
   */
  constructor(config?: {
    modelName: HMSNoiseCancellationModels;
    initialState: HMSNoiseCancellationInitialState;
  }) {
    _isNCAvailable.current = null;
    const data = {
      modelName: HMSNoiseCancellationModels.SmallFullBand,
      initialState: HMSNoiseCancellationInitialState.Enabled,
      ...config,
    };
    this.modelName = data.modelName;
    this.initialState = data.initialState;
  }

  /**
   * To make noise cancellation work your room needs to have noise cancellation feature enabled.
   *
   * Gets whether noise cancellation is available for your room.
   * @returns {boolean} True if noise cancellation is available, false otherwise.
   *
   * Note: You can call this API to check the state of noise cancellation only after successfully joining the room.
   */
  get isNoiseCancellationAvailable() {
    if (typeof _isNCAvailable.current === 'boolean') {
      return _isNCAvailable.current;
    }
    const data = HMSManagerModule.isNoiseCancellationPluginAvailable({
      id: HMSConstants.DEFAULT_SDK_ID,
    });
    _isNCAvailable.current = data.isAvailable as boolean;
    return _isNCAvailable.current;
  }

  /**
   * Enables noise cancellation.
   * @returns {Promise<boolean>} A promise that resolves to true if noise cancellation is enabled, otherwise, rejected promise is returned
   */
  async enable(): Promise<boolean> {
    logger?.verbose('#Function HMSNoiseCancellationPlugin#enable', null);

    try {
      return HMSManagerModule.enableNoiseCancellationPlugin({
        id: HMSConstants.DEFAULT_SDK_ID,
      });
    } catch (e) {
      logger?.error(
        '#Error in #Function HMSNoiseCancellationPlugin#enable ',
        e
      );
      return Promise.reject(e);
    }
  }

  /**
   * Disables noise cancellation.
   * @returns {Promise<boolean>} A promise that resolves to true if noise cancellation is disabled, otherwise, rejected promise is returned
   */
  async disable(): Promise<boolean> {
    logger?.verbose('#Function HMSNoiseCancellationPlugin#disable', null);

    try {
      return HMSManagerModule.disableNoiseCancellationPlugin({
        id: HMSConstants.DEFAULT_SDK_ID,
      });
    } catch (e) {
      logger?.error(
        '#Error in #Function HMSNoiseCancellationPlugin#disable ',
        e
      );
      return Promise.reject(e);
    }
  }

  /**
   * Checks if noise cancellation is enabled.
   * @returns {boolean} true if noise cancellation is enabled, false otherwise.
   */
  isEnabled(): boolean {
    logger?.verbose('#Function HMSNoiseCancellationPlugin#isEnabled', null);

    try {
      const data = HMSManagerModule.isNoiseCancellationPluginEnabled({
        id: HMSConstants.DEFAULT_SDK_ID,
      });
      return data.isEnabled;
    } catch (e) {
      logger?.error(
        '#Error in #Function HMSNoiseCancellationPlugin#isEnabled ',
        e
      );
      return false;
    }
  }
}

/**
 * Enum for HMS Noise Cancellation Models.
 * @enum {String}
 */
export enum HMSNoiseCancellationModels {
  SmallFullBand = 'SMALL_FULL_BAND',
}

/**
 * Enum for HMS Noise Cancellation Initial State.
 * @enum {String}
 */
export enum HMSNoiseCancellationInitialState {
  Enabled = 'ENABLED',
  Disabled = 'DISABLED',
}
