import {
  type HMSVideoTrack,
  HMSVideoViewMode,
  logger,
} from '@100mslive/react-native-hms';
import HMSManager from '../modules/HMSManagerModule';
import { HMSConstants } from './HMSConstants';

export class HMSIOSPIPController {
  async setupPIP() {
    const data = {
      id: HMSConstants.DEFAULT_SDK_ID,
    };
    logger?.verbose('#Function setupPIP', data);
    return await HMSManager.setupPIP(data);
  }

  async stopPIP() {
    const data = {
      id: HMSConstants.DEFAULT_SDK_ID,
    };
    logger?.verbose('#Function stopPIP', data);
    return await HMSManager.stopPIP(data);
  }

  async disposePIP() {
    const data = {
      id: HMSConstants.DEFAULT_SDK_ID,
    };
    logger?.verbose('#Function disposePIP', data);
    return await HMSManager.disposePIP(data);
  }

  async isPIPActive(): Promise<boolean> {
    const data = {
      id: HMSConstants.DEFAULT_SDK_ID,
    };
    logger?.verbose('#Function isPIPActive', data);
    return await HMSManager.isPIPActive(data);
  }
}
