import type { HMSRemotePeer, HMSRole } from '@100mslive/react-native-hms';

import { HmsStateActionTypes } from '../actionTypes';
import { ChatBroadcastFilter } from '../../utils/types';

type InitialType = {
  showChatView: boolean;
  typedMessage: string;
  sendTo: HMSRemotePeer | HMSRole | typeof ChatBroadcastFilter | null;
};

const INITIAL_STATE: InitialType = {
  showChatView: false,
  typedMessage: '',
  sendTo: null,
};

const chatWindowReducer = (state = INITIAL_STATE, action: any): InitialType => {
  switch (action.type) {
    case 'SET_SENDTO':
      return {
        ...state,
        sendTo: action.sendTo,
      };
    case 'SET_TYPED_MESSAGE':
      return {
        ...state,
        typedMessage: action.typedMessage,
      };
    case 'SET_SHOW_CHAT_VIEW':
      return {
        ...state,
        showChatView: action.showChatView,
      };
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default chatWindowReducer;
