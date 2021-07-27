import ActionTypes from '../actionTypes';
const INITIAL_STATE = {
  messages: [],
};

const messageReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ActionTypes.ADD_MESSAGE.REQUEST:
      return { ...state, messages: [...state.messages, action.payload] };
    case ActionTypes.CLEAR_MESSAGE_DATA.REQUEST:
      return { ...state, messages: [] };
    default:
      return state;
  }
};

export default messageReducer;
