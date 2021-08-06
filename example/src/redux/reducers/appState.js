import ActionTypes from '../actionTypes';
const INITIAL_STATE = {
  audioState: true,
  videoState: true,
};

const appReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ActionTypes.SET_AUDIO_VIDEO_STATE:
      return {...state, ...action.payload};
    default:
      return state;
  }
};

export default appReducer;
