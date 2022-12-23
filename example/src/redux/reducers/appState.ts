import ActionTypes from '../actionTypes';
import type {PeerTrackNode} from '../../utils/types';
import {PipModes} from '../../utils/types';
import {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSRemoteAudioStats,
  HMSRemoteVideoStats
} from '@100mslive/react-native-hms';

type ActionType = {
  payload: {[key: string]: any};
  type: String;
};

type IntialStateType = {
  peerState: PeerTrackNode[];
  pipModeStatus: PipModes;
  rtcStats: Record<string, undefined | HMSLocalAudioStats | HMSLocalVideoStats | HMSRemoteAudioStats | HMSRemoteVideoStats>;
  joinConfig: {
    mutedAudio: boolean;
    mutedVideo: boolean;
    mirrorCamera: boolean;
    skipPreview: boolean;
    audioMixer: boolean; // IOS only
    softwareDecoder: boolean; // Android only
    autoResize: boolean; // Android only
    autoSimulcast: boolean;
    showStats: boolean;
  };
};

const INITIAL_STATE: IntialStateType = {
  peerState: [],
  pipModeStatus: PipModes.INACTIVE,
  rtcStats: {},
  joinConfig: {
    mutedAudio: true,
    mutedVideo: true,
    mirrorCamera: true,
    skipPreview: false,
    audioMixer: false, // IOS only
    softwareDecoder: true, // Android only
    autoResize: false, // Android only
    autoSimulcast: true,
    showStats: false,
  },
};

const appReducer = (
  state = INITIAL_STATE,
  action: ActionType,
): IntialStateType => {
  switch (action.type) {
    case ActionTypes.CHANGE_PIP_MODE_STATUS:
      return {...state, pipModeStatus: action.payload.pipModeStatus};
    case ActionTypes.SET_PEER_STATE:
      return {...state, ...action.payload};
    case ActionTypes.CLEAR_PEER_DATA.REQUEST:
      return {...state, peerState: []};
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
    case ActionTypes.CHANGE_SHOW_STATS:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          showStats: action.payload.showStats ?? false,
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
    case ActionTypes.SET_RTC_STATS:
      return {
        ...state,
        rtcStats: {
          ...state.rtcStats,
          [action.payload.trackId]: action.payload.stats,
        }
      };
    default:
      return state;
  }
};

export default appReducer;
