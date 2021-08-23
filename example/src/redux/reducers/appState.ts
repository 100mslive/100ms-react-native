import ActionTypes from '../actionTypes';

type ActionType = {
  payload: Object;
  type: String;
};

const INITIAL_STATE = {
  audioState: true,
  videoState: true,
};

const appReducer = (state = INITIAL_STATE, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.SET_AUDIO_VIDEO_STATE:
      return {...state, ...action.payload};
    default:
      return state;
  }
};

export default appReducer;
