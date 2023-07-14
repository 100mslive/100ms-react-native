import type { HMSMessage } from '@100mslive/react-native-hms';
import ActionTypes, { HmsStateActionTypes } from '../actionTypes';

type ActionType = {
  payload: HMSMessage | (string | null | undefined);
  type: String;
};

type InitType = {
  messages: Array<HMSMessage>;
  pinnedMessage: string | null | undefined;
};

const INITIAL_STATE: InitType = {
  messages: [],
  pinnedMessage: null,
};

const messageReducer = (state = INITIAL_STATE, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.ADD_PINNED_MESSAGE.REQUEST:
      const pinnedMessage = action.payload as string | null | undefined;
      return { ...state, pinnedMessage };
    case ActionTypes.ADD_MESSAGE.REQUEST:
      const message = action.payload as HMSMessage;
      return { ...state, messages: [message, ...state.messages] };
    case ActionTypes.CLEAR_MESSAGE_DATA.REQUEST:
      return { ...state, messages: [] };
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default messageReducer;
