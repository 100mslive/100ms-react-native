import HMSManagerModule from '../modules/HMSManagerModule';
import { HMSConstants } from './HMSConstants';
import { logger } from './HMSLogger';

export class HMSNoiseCancellationPlugin {
  // __isNCAvailable: boolean | null = null;

  modelName: HMSNoiseCancellationModels;
  initialState: HMSNoiseCancellationInitialState;

  constructor(config?: {
    modelName: HMSNoiseCancellationModels;
    initialState: HMSNoiseCancellationInitialState;
  }) {
    const data = {
      modelName: HMSNoiseCancellationModels.SmallFullBand,
      initialState: HMSNoiseCancellationInitialState.Enabled,
      ...config,
    };
    this.modelName = data.modelName;
    this.initialState = data.initialState;
  }

  isNoiseCancellationAvailable(): boolean {
    // console.log('##### Local state isNoiseCancellationPluginAvailable > ', this.__isNCAvailable);
    // if (typeof this.__isNCAvailable === 'boolean') {
    //   console.log('##### returning early > ', this.__isNCAvailable);
    //   return this.__isNCAvailable;
    // }

    // try {
    //   const data = HMSManagerModule.isNoiseCancellationPluginAvailable({
    //     id: HMSConstants.DEFAULT_SDK_ID,
    //   });
    //   this.__isNCAvailable = data.isAvailable;
    //   console.log('##### returning > ', data.isAvailable);
    //   return data.isAvailable;
    // } catch (e) {
    //   logger?.error('#Error in #Getter HMSNoiseCancellationPlugin#isNoiseCancellationAvailable ', e);
    //   return false;
    // }
    // console.log('##### __isNCAvailable > ', this.__isNCAvailable);
    const data = HMSManagerModule.isNoiseCancellationPluginAvailable({
      id: HMSConstants.DEFAULT_SDK_ID,
    });
    // this.__isNCAvailable = data.isAvailable;

    return data.isAvailable;
  }

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

export enum HMSNoiseCancellationModels {
  SmallFullBand = 'SMALL_FULL_BAND',
}

export enum HMSNoiseCancellationInitialState {
  Enabled = 'ENABLED',
  Disabled = 'DISABLED',
}
