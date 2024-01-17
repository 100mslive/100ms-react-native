import HMSManager from '../modules/HMSManagerModule';
import { HMSConstants } from './HMSConstants';
import { logger } from './HMSLogger';
import type { HMSPollCreateParams } from './polls/HMSPollCreateParams';

export class HMSInteractivityCenter {
  async startPoll(pollParams: HMSPollCreateParams) {
    const data = {
      ...pollParams,
      id: HMSConstants.DEFAULT_SDK_ID,
    };
    logger?.verbose('#Function quickStartPoll', data);
    return HMSManager.quickStartPoll(data);
  }
}
