import type { HMSMessage } from '@100mslive/react-native-hms';
import ActionTypes, { HmsStateActionTypes } from '../actionTypes';
import type { PinnedMessage } from '../../types';

type ActionType = {
  payload: HMSMessage | PinnedMessage[] | string[];
  type: String;
};

type InitType = {
  messages: Array<HMSMessage>;
  pinnedMessages: PinnedMessage[];
};

const INITIAL_STATE: InitType = {
  messages: [],
  pinnedMessages: [],
};

const messageReducer = (state = INITIAL_STATE, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.ADD_PINNED_MESSAGES.REQUEST:
      const pinnedMessages = (action.payload ??
        INITIAL_STATE.pinnedMessages) as PinnedMessage[];
      return { ...state, pinnedMessages };
    case ActionTypes.ADD_MESSAGE.REQUEST:
      const message = action.payload as HMSMessage;
      return { ...state, messages: [message, ...state.messages] };
    case ActionTypes.CLEAR_MESSAGE_DATA.REQUEST:
      return { ...state, messages: [] };
    case ActionTypes.FILTER_OUT_BLOCKED_MSGS:
      const chatPeerBlacklist = action.payload as string[];
      return {
        ...state,
        messages: state.messages.filter((message) => {
          const senderUserId = message.sender?.customerUserID;
          if (!senderUserId) {
            return true;
          }
          return !chatPeerBlacklist.includes(senderUserId);
        }),
      };
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default messageReducer;
