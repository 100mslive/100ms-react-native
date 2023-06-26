import ActionTypes, {HmsStateActionTypes} from '../actionTypes';
import type {PeerTrackNode} from '../../utils/types';
import {SUPPORTED_ASPECT_RATIOS} from '../../utils/types';
import {PipModes} from '../../utils/types';
import {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSRemoteAudioStats,
  HMSRemoteVideoStats,
} from '@100mslive/react-native-hms';

type ActionType = {
  payload: {[key: string]: any};
  type: String;
};

type IntialStateType = {
  peerState: PeerTrackNode[];
  pipModeStatus: PipModes;
  rtcStats: Record<
    string,
    | undefined
    | HMSLocalAudioStats
    | HMSLocalVideoStats[]
    | HMSRemoteAudioStats
    | HMSRemoteVideoStats
  >;
  hlsAspectRatio: {value: number; id: string};
  joinConfig: {
    mirrorCamera: boolean;
    autoSimulcast: boolean;
    showStats: boolean;
    showHLSStats: boolean;
    enableHLSPlayerControls: boolean;
    showCustomHLSPlayerControls: boolean;
  };
};

const INITIAL_STATE: IntialStateType = {
  peerState: [],
  pipModeStatus: PipModes.INACTIVE,
  rtcStats: {},
  hlsAspectRatio: SUPPORTED_ASPECT_RATIOS[0],
  joinConfig: {
    mirrorCamera: true,
    autoSimulcast: true,
    showStats: false,
    showHLSStats: false,
    enableHLSPlayerControls: true,
    showCustomHLSPlayerControls: false,
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
    case ActionTypes.CHANGE_HLS_ASPECT_RATIO:
      return {...state, hlsAspectRatio: action.payload.hlsAspectRatio};
    case ActionTypes.RESET_JOIN_CONFIG:
      return {...state, joinConfig: INITIAL_STATE.joinConfig};
    case ActionTypes.CHANGE_MIRROR_CAMERA:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          mirrorCamera: action.payload.mirrorCamera ?? true,
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
    case ActionTypes.CHANGE_SHOW_HLS_STATS:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          showHLSStats: action.payload.showHLSStats ?? false,
        },
      };
    case ActionTypes.CHANGE_ENABLE_HLS_PLAYER_CONTROLS:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          enableHLSPlayerControls:
            action.payload.enableHLSPlayerControls ?? true,
        },
      };
    case ActionTypes.CHANGE_SHOW_CUSTOM_HLS_PLAYER_CONTROLS:
      return {
        ...state,
        joinConfig: {
          ...state.joinConfig,
          showCustomHLSPlayerControls:
            action.payload.showCustomHLSPlayerControls ?? false,
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
        },
      };
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default appReducer;
