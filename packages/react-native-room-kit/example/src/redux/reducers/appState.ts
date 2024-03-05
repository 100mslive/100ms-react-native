import ActionTypes from '../actionTypes';

type ActionType = {
  payload: { [key: string]: any };
  type: String;
};

type InitialStateType = {
  joinConfig: {
    debugMode: boolean;
    mutedAudio: boolean;
    mutedVideo: boolean;
    mirrorCamera: boolean;
    skipPreview: boolean;
    audioMixer: boolean; // IOS only
    musicMode: boolean; // IOS only
    softwareDecoder: boolean; // Android only
    autoResize: boolean; // Android only
    autoSimulcast: boolean;
    staticUserId: boolean;
  };
};

const INITIAL_STATE: InitialStateType = {
  joinConfig: {
    debugMode: false,
    mutedAudio: true,
    mutedVideo: true,
    mirrorCamera: true,
    skipPreview: false,
    audioMixer: false, // IOS only
    musicMode: false, // IOS only
    softwareDecoder: true, // Android only
    autoResize: false, // Android only
    autoSimulcast: true,
    staticUserId: true,
  },
};

const appReducer = (
  state = INITIAL_STATE,
  action: ActionType
): InitialStateType => {
  switch (action.type) {
    case ActionTypes.RESET_JOIN_CONFIG:
      return {
        ...state,
        joinConfig: {
          ...INITIAL_STATE.joinConfig,
          debugMode: state.joinConfig.debugMode,
        },
      };
    case ActionTypes.CHANGE_DEBUG_INFO:
      return {
        ...state,
        joinConfig: {
          ...INITIAL_STATE.joinConfig,
          debugMode: action.payload.debugMode ?? false,
        },
      };
    case ActionTypes.CHANGE_JOIN_AUDIO_MUTED:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          mutedAudio: action.payload.mutedAudio ?? false,
        },
      };
    case ActionTypes.CHANGE_JOIN_VIDEO_MUTED:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          mutedVideo: action.payload.mutedVideo ?? false,
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
    case ActionTypes.CHANGE_JOIN_SKIP_PREVIEW:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          skipPreview: action.payload.skipPreview ?? false,
        },
      };
    case ActionTypes.CHANGE_AUDIO_MIXER:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          audioMixer: action.payload.audioMixer ?? false,
        },
      };
    case ActionTypes.CHANGE_MUSIC_MODE:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          musicMode: action.payload.musicMode ?? false,
        },
      };
    case ActionTypes.CHANGE_SOFTWARE_DECODER:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          softwareDecoder: action.payload.softwareDecoder ?? true,
        },
      };
    case ActionTypes.CHANGE_AUTO_RESIZE:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          autoResize: action.payload.autoResize ?? false,
        },
      };
    case ActionTypes.CHANGE_AUTO_SIMULCAST:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          autoSimulcast: action.payload.autoSimulcast ?? true,
        },
      };
    case ActionTypes.CHANGE_USE_STATIC_USERID:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          staticUserId:
            action.payload.staticUserId ??
            INITIAL_STATE.joinConfig.staticUserId,
        },
      };
    default:
      return state;
  }
};

export default appReducer;
