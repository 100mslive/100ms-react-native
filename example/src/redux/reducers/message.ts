import ActionTypes from '../actionTypes';

type ActionType = {
  payload: Object;
  type: String;
};

type InitType = {
  messages: Array<any>;
};

const INITIAL_STATE: InitType = {
  messages: [],
};

const messageReducer = (state = INITIAL_STATE, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.ADD_MESSAGE.REQUEST:
      return {...state, messages: [...state.messages, action.payload]};
    case ActionTypes.CLEAR_MESSAGE_DATA.REQUEST:
      return {...state, messages: []};
    default:
      return state;
  }
};

export default messageReducer;
