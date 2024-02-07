import { EventEmitter } from '../utils';
import HMSManager from '../modules/HMSManagerModule';
import { HMSConstants } from './HMSConstants';
import { logger } from './HMSLogger';
import type { HMSPoll } from './polls/HMSPoll';
import type { HMSPollCreateParams } from './polls/HMSPollCreateParams';
import type { HMSPollUpdateType } from './polls/HMSPollUpdateType';
import { HMSPollsListenerActions } from './HMSPollsListenerActions';
import HMSNativeEventListener from './HMSNativeEventListener';
import type { HMSEventSubscription } from './HMSNativeEventEmitter';

type PollUpdateListener = (data: {
  updatedPoll: HMSPoll;
  update: HMSPollUpdateType;
}) => void;

let pollUpdateSubscription: null | HMSEventSubscription = null;

function registerPollUpdateListener(listener: PollUpdateListener) {
  console.log('***** checking existance of pollUpdateSubscription');
  if (pollUpdateSubscription !== null) {
    return;
  }
  console.log('***** registering PollUpdateListener');
  pollUpdateSubscription = HMSNativeEventListener.addListener(
    HMSConstants.DEFAULT_SDK_ID,
    HMSPollsListenerActions.ON_POLL_UPDATE,
    listener
  );
  console.log('***** Registerd PollUpdateListener');
}

function unregisterPollUpdateListener() {
  if (pollUpdateSubscription === null) {
    return;
  }
  pollUpdateSubscription.remove();
  pollUpdateSubscription = null;
  console.log('***** Unregisterd PollUpdateListener');
}

export class HMSInteractivityCenter {
  private _eventEmitter = new EventEmitter();

  private _pollUpdateListener = (...args: Parameters<PollUpdateListener>) => {
    const { updatedPoll, update } = args[0];
    logger?.verbose('#Listener ON_POLL_UPDATE', {
      update,
      updatedPoll,
    });
    this._eventEmitter.emit(
      HMSPollsListenerActions.ON_POLL_UPDATE,
      updatedPoll,
      update
    );
  };

  private _onAllPollUpdateListenerRemoved = () => {
    unregisterPollUpdateListener();
  };

  constructor() {
    this._eventEmitter.registerOnAllListenersRemoved(
      this._onAllPollUpdateListenerRemoved
    );
  }

  addPollUpdateListener(
    listener: (updatedPoll: HMSPoll, update: HMSPollUpdateType) => void
  ) {
    registerPollUpdateListener(this._pollUpdateListener);
    return this._eventEmitter.addListener(
      HMSPollsListenerActions.ON_POLL_UPDATE,
      listener,
      null
    );
  }

  /**
   * Starts a poll
   *
   * @param pollParams
   */
  async startPoll(pollParams: HMSPollCreateParams) {
    const data = {
      ...pollParams,
      id: HMSConstants.DEFAULT_SDK_ID,
    };
    logger?.verbose('#Function quickStartPoll', JSON.stringify(data));
    return HMSManager.quickStartPoll(data);
  }
}
