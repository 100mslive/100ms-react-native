import ActionTypes from '../actionTypes';

type ActionType = {
  payload: {[key: string]: any};
  type: String;
};

type IntialStateType = {
  joinConfig: {
    mutedAudio: boolean;
    mutedVideo: boolean;
    mirrorCamera: boolean;
  };
};

const INITIAL_STATE: IntialStateType = {
  joinConfig: {
    mutedAudio: true,
    mutedVideo: true,
    mirrorCamera: true,
  },
};

const appReducer = (
  state = INITIAL_STATE,
  action: ActionType,
): IntialStateType => {
  switch (action.type) {
    case ActionTypes.RESET_JOIN_CONFIG:
      return {...state, joinConfig: INITIAL_STATE.joinConfig};
    case ActionTypes.CHANGE_JOIN_AUDIO_MUTED:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          mutedAudio: action.payload.mutedAudio ?? true,
        },
      };
    case ActionTypes.CHANGE_JOIN_VIDEO_MUTED:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          mutedVideo: action.payload.mutedVideo ?? true,
        },
      };
    case ActionTypes.CHANGE_MIRROR_CAMERA:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          mirrorCamera: action.payload.mirrorCamera ?? true,
        },
      };
    default:
      return state;
  }
};

export default appReducer;
