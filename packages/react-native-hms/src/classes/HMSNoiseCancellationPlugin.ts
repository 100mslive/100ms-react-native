import HMSManagerModule from '../modules/HMSManagerModule';
import { HMSConstants } from './HMSConstants';
import { logger } from './HMSLogger';

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
    const data = {
      modelName: HMSNoiseCancellationModels.SmallFullBand,
      initialState: HMSNoiseCancellationInitialState.Disabled,
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
  async isNoiseCancellationAvailable(): Promise<boolean> {
    const data = { id: HMSConstants.DEFAULT_SDK_ID };
    logger?.verbose(
      '#Function HMSNoiseCancellationPlugin#isNoiseCancellationAvailable',
      data
    );

    try {
      return HMSManagerModule.isNoiseCancellationPluginAvailable(data);
    } catch (e) {
      logger?.error(
        '#Error in #Function HMSNoiseCancellationPlugin#isNoiseCancellationAvailable ',
        e
      );
      return Promise.reject(e);
    }
  }

  /**
   * Enables noise cancellation.
   * @returns {Promise<boolean>} A promise that resolves to true if noise cancellation is enabled, otherwise, rejected promise is returned
   */
  async enable(): Promise<boolean> {
    const data = { id: HMSConstants.DEFAULT_SDK_ID };
    logger?.verbose('#Function HMSNoiseCancellationPlugin#enable', data);

    try {
      return HMSManagerModule.enableNoiseCancellationPlugin(data);
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
    const data = { id: HMSConstants.DEFAULT_SDK_ID };
    logger?.verbose('#Function HMSNoiseCancellationPlugin#disable', data);

    try {
      return HMSManagerModule.disableNoiseCancellationPlugin(data);
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
  async isEnabled(): Promise<boolean> {
    const data = { id: HMSConstants.DEFAULT_SDK_ID };
    logger?.verbose('#Function HMSNoiseCancellationPlugin#isEnabled', data);

    try {
      return HMSManagerModule.isNoiseCancellationPluginEnabled(data);
    } catch (e) {
      logger?.error(
        '#Error in #Function HMSNoiseCancellationPlugin#isEnabled ',
        e
      );
      return Promise.reject(e);
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
