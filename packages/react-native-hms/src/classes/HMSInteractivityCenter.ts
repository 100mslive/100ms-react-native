import HMSManager from '../modules/HMSManagerModule';
import { HMSConstants } from './HMSConstants';
import { logger } from './HMSLogger';

import type { HMSPollBuilder } from './polls/HMSPollBuilder';

export class HMSInteractivityCenter {
  async quickStartPoll(pollBuilder: HMSPollBuilder) {
    const data = {
      ...pollBuilder,
      id: HMSConstants.DEFAULT_SDK_ID,
    };
    logger?.verbose('#Function quickStartPoll', JSON.stringify(data));
    return HMSManager.quickStartPoll(data);
  }
}
