import { HmsStateActionTypes } from '../actionTypes';

type InitialType = {
  showChatView: boolean;
  typedMessage: string;
  sendTo: any;
  sendToType: 'everyone' | 'role' | 'direct';
};

const INITIAL_STATE: InitialType = {
  showChatView: false,
  typedMessage: '',
  sendTo: { name: 'everyone' },
  sendToType: 'everyone', // 'everyone' | 'role' | 'direct'
};

const chatWindowReducer = (state = INITIAL_STATE, action: any): InitialType => {
  switch (action.type) {
    case 'SET_SENDTO':
      return {
        ...state,
        sendTo: action.sendTo,
        sendToType: action.sendToType,
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
