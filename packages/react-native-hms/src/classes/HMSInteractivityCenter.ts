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
import { HMSHelper } from './HMSHelper';
import type { PollLeaderboardResponse } from './polls/PollLeaderboardResponse';
import type { DecodedPollLeaderboardResponse } from './polls/DecodedPollLeaderboardResponse';
import type { HMSWhiteboardUpdateType } from './whiteboard/HMSWhiteboardUpdateType';
import type { HMSWhiteboard } from './whiteboard/HMSWhiteboard';
import { HMSWhiteboardListenerActions } from './whiteboard/HMSWhiteboardListenerActions';
import {
  WhiteboardUpdateListener,
  registerWhiteboardUpdateListener,
  unregisterWhiteboardUpdateListener,
} from './whiteboard/registerCallbacks';

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
  if (pollUpdateSubscription !== null) {
    return;
  }
  pollUpdateSubscription = HMSNativeEventListener.addListener(
    HMSConstants.DEFAULT_SDK_ID,
    HMSPollsListenerActions.ON_POLL_UPDATE,
    listener
  );
}

function unregisterPollUpdateListener() {
  if (pollUpdateSubscription === null) {
    return;
  }
  pollUpdateSubscription.remove();
  pollUpdateSubscription = null;
}

export class HMSInteractivityCenter {
  private _eventEmitter = new EventEmitter();

  private onUpdateListenerRemoved(eventType: string) {
    if (eventType === HMSPollsListenerActions.ON_POLL_UPDATE) {
      unregisterPollUpdateListener();
    } else if (
      eventType === HMSWhiteboardListenerActions.ON_WHITEBOARD_UPDATE
    ) {
      unregisterWhiteboardUpdateListener();
    } else {
      console.warn('Unknown update listener removed: ', eventType);
    }
  }

  constructor() {
    this._eventEmitter.registerOnAllListenersRemoved(
      this.onUpdateListenerRemoved
    );
  }

  //#region Poll Methods & Listeners

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
    const transformedPollParams = {
      ...pollParams,
      rolesThatCanVote: pollParams.rolesThatCanVote
        ? HMSHelper.getRoleNames(pollParams.rolesThatCanVote)
        : undefined,
      rolesThatCanViewResponses: pollParams.rolesThatCanViewResponses
        ? HMSHelper.getRoleNames(pollParams.rolesThatCanViewResponses)
        : undefined,
    };

    const data = {
      ...transformedPollParams,
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

  /**
   * Fetches the leaderboard for a poll
   * @param pollId - The id of the poll
   * @param count - The number of entries to fetch
   * @param startIndex - The index to start fetching from
   * @param includeCurrentPeer - Whether to include the current peer in the fetched leaderboard entries
   * @returns Promise<PollLeaderboardResponse>
   */
  async fetchLeaderboard(
    pollId: string,
    count: number,
    startIndex: number,
    includeCurrentPeer: boolean
  ): Promise<PollLeaderboardResponse> {
    const data = {
      id: HMSConstants.DEFAULT_SDK_ID,
      pollId,
      count,
      startIndex,
      includeCurrentPeer,
    };
    logger?.verbose('#Function fetchLeaderboard', data);

    const response: DecodedPollLeaderboardResponse =
      await HMSManager.fetchLeaderboard(data);
    return HMSInteractivityEncoder.transformPollLeaderboardResponse(response);
  }
  //#endregion Poll Methods & Listeners

  //#region Whiteboard Methods & Listeners

  private _whiteboardUpdateListener = (
    ...args: Parameters<WhiteboardUpdateListener>
  ) => {
    const { hmsWhiteboard, updateType } = args[0];
    logger?.verbose('#Listener ON_WHITEBOARD_UPDATE', {
      updateType,
      hmsWhiteboard,
    });
    this._eventEmitter.emit(
      HMSWhiteboardListenerActions.ON_WHITEBOARD_UPDATE,
      HMSInteractivityEncoder.transformHMSWhiteboard(hmsWhiteboard),
      updateType
    );
  };

  /**
   * Adds a listener for Whiteboard updates
   * @param listener - Callback to be called when whiteboard is updated
   * @returns HMSEventSubscription
   */
  addWhiteboardUpdateListener(
    listener: (
      hmsWhiteboard: HMSWhiteboard,
      updateType: HMSWhiteboardUpdateType
    ) => void
  ) {
    registerWhiteboardUpdateListener(this._whiteboardUpdateListener);
    return this._eventEmitter.addListener(
      HMSWhiteboardListenerActions.ON_WHITEBOARD_UPDATE,
      listener,
      null
    );
  }

  /**
   * Starts Whiteboard
   */
  async startWhiteboard(title: string) {
    const data = {
      id: HMSConstants.DEFAULT_SDK_ID,
      title,
    };
    logger?.verbose('#Function startWhiteboard', data);
    return HMSManager.startWhiteboard(data);
  }

  /**
   * Stops Whiteboard
   */
  async stopWhiteboard() {
    const data = {
      id: HMSConstants.DEFAULT_SDK_ID,
    };
    logger?.verbose('#Function stopWhiteboard', data);
    return HMSManager.stopWhiteboard(data);
  }
  //#endregion Whiteboard Methods & Listeners
}
