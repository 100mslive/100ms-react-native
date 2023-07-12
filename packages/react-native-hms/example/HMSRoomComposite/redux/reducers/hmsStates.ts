import type {
  HMSLocalPeer,
  HMSRole,
  HMSRoom,
} from '@100mslive/react-native-hmslive';
import {HmsStateActionTypes} from '../actionTypes';

type ActionType =
  | SetRoomAction
  | SetLocalPeerAction
  | SetRolesAction
  | SetIsLocalAudioMutedAction
  | SetIsLocalVideoMutedAction
  | SetIsLocalScreenSharedAction
  | SetRoomLocallyMutedAction
  | ResetAction;

type SetRoomAction = {
  type: HmsStateActionTypes.SET_ROOM_STATE;
  room: HMSRoom | null;
};

type SetLocalPeerAction = {
  type: HmsStateActionTypes.SET_LOCAL_PEER_STATE;
  localPeer: HMSLocalPeer | null;
};

type SetRolesAction = {
  type: HmsStateActionTypes.SET_ROLES_STATE;
  roles: HMSRole[];
};

type SetIsLocalAudioMutedAction = {
  type: HmsStateActionTypes.SET_IS_LOCAL_AUDIO_MUTED_STATE;
  isLocalAudioMuted: boolean | undefined;
};

type SetIsLocalVideoMutedAction = {
  type: HmsStateActionTypes.SET_IS_LOCAL_VIDEO_MUTED_STATE;
  isLocalVideoMuted: boolean | undefined;
};

type SetIsLocalScreenSharedAction = {
  type: HmsStateActionTypes.SET_IS_LOCAL_SCREEN_SHARED_STATE;
  isLocalScreenShared: boolean | undefined;
};

type ResetAction = {
  type: HmsStateActionTypes.CLEAR_STATES;
};

type SetRoomLocallyMutedAction = {
  type: HmsStateActionTypes.SET_ROOM_LOCALLY_MUTED;
  roomLocallyMuted: boolean;
};

type IntialStateType = {
  isLocalAudioMuted: boolean | undefined;
  isLocalVideoMuted: boolean | undefined;
  isLocalScreenShared: boolean | undefined;
  roomLocallyMuted: boolean;
  room: HMSRoom | null;
  localPeer: HMSLocalPeer | null;
  roles: HMSRole[];
};

const INITIAL_STATE: IntialStateType = {
  isLocalAudioMuted: undefined,
  isLocalVideoMuted: undefined,
  isLocalScreenShared: undefined,
  roomLocallyMuted: false,
  room: null,
  localPeer: null,
  roles: [],
};

const hmsStatesReducer = (
  state = INITIAL_STATE,
  action: ActionType,
): IntialStateType => {
  switch (action.type) {
    case HmsStateActionTypes.SET_ROOM_STATE:
      return {
        ...state,
        room: action.room,
      };
    case HmsStateActionTypes.SET_LOCAL_PEER_STATE:
      return {
        ...state,
        localPeer: action.localPeer,
        isLocalAudioMuted: action.localPeer?.audioTrack?.isMute(),
        isLocalVideoMuted: action.localPeer?.videoTrack?.isMute(),
      };
    case HmsStateActionTypes.SET_ROLES_STATE:
      return {
        ...state,
        roles: action.roles,
      };
    case HmsStateActionTypes.SET_IS_LOCAL_AUDIO_MUTED_STATE:
      return {
        ...state,
        isLocalAudioMuted: action.isLocalAudioMuted,
      };
    case HmsStateActionTypes.SET_IS_LOCAL_VIDEO_MUTED_STATE:
      return {
        ...state,
        isLocalVideoMuted: action.isLocalVideoMuted,
      };
    case HmsStateActionTypes.SET_IS_LOCAL_SCREEN_SHARED_STATE:
      return {
        ...state,
        isLocalScreenShared: action.isLocalScreenShared,
      };
    case HmsStateActionTypes.SET_ROOM_LOCALLY_MUTED:
      return {
        ...state,
        roomLocallyMuted: action.roomLocallyMuted,
      };
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default hmsStatesReducer;
