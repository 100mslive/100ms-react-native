import {HmsStateActionTypes} from '../actionTypes';

const INITIAL_STATE = {
  showChatView: false,
  typedMessage: '',
  sendTo: {name: 'everyone'},
  sendToType: 'everyone', // 'everyone' | 'role' | 'direct'
};

const chatWindowReducer = (state = INITIAL_STATE, action: any): any => {
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
