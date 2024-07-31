import HMSManagerModule from '../modules/HMSManagerModule';
import { HMSConstants } from './HMSConstants';
import { logger } from './HMSLogger';

/**
 * Represents the HMS Noise Cancellation Plugin.
 * This class encapsulates the functionality for managing noise cancellation within a room, including enabling, disabling, and checking the availability and current state of noise cancellation.
 *
 * @property {HMSNoiseCancellationModels} modelName - Specifies the model of noise cancellation to be used.
 * This property determines the algorithm and intensity of noise cancellation, allowing for customization
 * based on the requirements of the room or application.
 *
 * @property {HMSNoiseCancellationInitialState} initialState - Defines the initial state of noise cancellation
 * when the plugin is instantiated. This can be either enabled or disabled, providing control over the
 * noise cancellation feature's activation upon initialization.
 *
 * @see https://www.100ms.live/docs/react-native/v2/how-to-guides/extend-capabilities/noise-cancellation
 */
export class HMSNoiseCancellationPlugin {
  /**
   * The `modelName` property specifies the model of noise cancellation to be used within the HMS Noise Cancellation Plugin.
   * This property determines the algorithm and intensity of noise cancellation, allowing for customization
   * based on the specific requirements of the room or application. It is of type `HMSNoiseCancellationModels`,
   * an enum that defines the available noise cancellation models.
   */
  modelName: HMSNoiseCancellationModels;

  /**
   * Defines the initial state of noise cancellation when the plugin is instantiated.
   * This property can be set to either `HMSNoiseCancellationInitialState.Enabled`
   * or `HMSNoiseCancellationInitialState.Disabled`, determining whether noise cancellation should be active
   * immediately upon the plugin's instantiation. This allows for control over the feature's initial activation state,
   * catering to scenarios where noise cancellation needs to be either immediately available or manually activated later.
   */
  initialState: HMSNoiseCancellationInitialState;

  /**
   * Constructs a new HMSNoiseCancellationPlugin instance with optional configuration settings.
   * This constructor allows for the initialization of the plugin with specific noise cancellation
   * model and initial state settings, providing flexibility in how noise cancellation is applied
   * within the application.
   *
   * @param {Object} [config] - Optional configuration object for the plugin.
   * @param {HMSNoiseCancellationModels} [config.modelName] - Specifies the noise cancellation model to be used.
   *        This determines the algorithm and intensity of noise cancellation. If not provided, a default
   *        model is used.
   * @param {HMSNoiseCancellationInitialState} [config.initialState] - Sets the initial state of noise cancellation
   *        (enabled or disabled) when the plugin is instantiated. Defaults to disabled if not specified.
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
      return await HMSManagerModule.isNoiseCancellationPluginAvailable(data);
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
      return await HMSManagerModule.enableNoiseCancellationPlugin(data);
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
      return await HMSManagerModule.disableNoiseCancellationPlugin(data);
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
      return await HMSManagerModule.isNoiseCancellationPluginEnabled(data);
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
