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
import { HMSInteractivityEncoder } from './HMSInteractivityEncoder';

type PollUpdateListener = (data: {
  updatedPoll: HMSPoll;
  update: HMSPollUpdateType;
}) => void;

type PollQuestionResponseCreateParams = {
  pollId: string;
  pollQuestionIndex: number;
  responses:
    | {
        text: string;
        duration?: number;
      }
    | {
        options: number[];
        duration?: number;
      };
};

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
      HMSInteractivityEncoder.transformPoll(updatedPoll),
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

  /**
   * Adds a listener for poll updates
   * @param listener - Callback to be called when a poll is updated
   * @returns HMSEventSubscription
   */
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
    logger?.verbose('#Function startPoll', JSON.stringify(data));
    return HMSManager.quickStartPoll(data);
  }

  async add(pollQuestionResponseParams: PollQuestionResponseCreateParams) {
    const data = {
      ...pollQuestionResponseParams,
      id: HMSConstants.DEFAULT_SDK_ID,
    };
    logger?.verbose('#Function add', JSON.stringify(data));
    return HMSManager.addResponseOnPollQuestion(data);
  }

  async stop(pollId: string) {
    const data = {
      id: HMSConstants.DEFAULT_SDK_ID,
      pollId,
    };
    logger?.verbose('#Function stop', JSON.stringify(data));
    return HMSManager.stopPoll(data);
  }
}
