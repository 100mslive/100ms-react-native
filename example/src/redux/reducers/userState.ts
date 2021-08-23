import ActionTypes from '../actionTypes';

type ActionType = {
  payload: Object;
  type: String;
};

const INITIAL_STATE = {
  userName: null,
};

const userReducer = (state = INITIAL_STATE, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.SAVE_USER_DATA.REQUEST:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;
