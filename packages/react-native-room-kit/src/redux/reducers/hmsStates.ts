import type {
  HMSLocalPeer,
  HMSPeer,
  HMSRole,
  HMSRoleChangeRequest,
  HMSRoom,
} from '@100mslive/react-native-hms';
import type { Layout } from '@100mslive/types-prebuilt';
import { HmsStateActionTypes } from '../actionTypes';

type ActionType =
  | SetRoomAction
  | SetLocalPeerAction
  | SetRolesAction
  | SetIsLocalAudioMutedAction
  | SetIsLocalVideoMutedAction
  | SetIsLocalScreenSharedAction
  | SetRoomLocallyMutedAction
  | ResetAction
  | AddToPreviewPeersList
  | RemoveFromPreviewPeersList
  | SetLayoutConfig
  | SetRoleChangeRequest
  | AddRemoveParticipant
  | AddUpdateParticipant;

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

type AddToPreviewPeersList = {
  type: HmsStateActionTypes.ADD_TO_PREVIEW_PEERS_LIST;
  peer: HMSPeer;
};

type RemoveFromPreviewPeersList = {
  type: HmsStateActionTypes.REMOVE_FROM_PREVIEW_PEERS_LIST;
  peerId: string;
};

type SetLayoutConfig = {
  type: HmsStateActionTypes.SET_LAYOUT_CONFIG;
  layoutConfig: Layout[];
};

type SetRoleChangeRequest = {
  type: HmsStateActionTypes.SET_ROLE_CHANGE_REQUEST;
  roleChangeRequest: HMSRoleChangeRequest | null;
};

type AddRemoveParticipant = {
  type: HmsStateActionTypes.ADD_REMOVE_PARTICIPANT;
  remoteParticipant: HMSPeer;
};

type AddUpdateParticipant = {
  type: HmsStateActionTypes.ADD_UPDATE_PARTICIPANT;
  remoteParticipant: HMSPeer;
};

type IntialStateType = {
  isLocalAudioMuted: boolean | undefined;
  isLocalVideoMuted: boolean | undefined;
  isLocalScreenShared: boolean | undefined;
  roomLocallyMuted: boolean;
  room: HMSRoom | null;
  localPeer: HMSLocalPeer | null;
  remoteParticipants: HMSPeer[];
  roles: HMSRole[];
  previewPeersList: HMSPeer[];
  layoutConfig: Layout[] | null;
  roleChangeRequest: HMSRoleChangeRequest | null;
};

const INITIAL_STATE: IntialStateType = {
  isLocalAudioMuted: undefined,
  isLocalVideoMuted: undefined,
  isLocalScreenShared: undefined,
  roomLocallyMuted: false,
  room: null,
  localPeer: null,
  remoteParticipants: [],
  roles: [],
  previewPeersList: [],
  layoutConfig: null,
  roleChangeRequest: null,
};

const hmsStatesReducer = (
  state = INITIAL_STATE,
  action: ActionType
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
    case HmsStateActionTypes.ADD_REMOVE_PARTICIPANT: {
      if (
        state.remoteParticipants.findIndex(
          (remoteParticipant) =>
            remoteParticipant.peerID === action.remoteParticipant.peerID
        ) >= 0
      ) {
        return {
          ...state,
          remoteParticipants: state.remoteParticipants.filter(
            (remoteParticipant) =>
              remoteParticipant.peerID !== action.remoteParticipant.peerID
          ),
        };
      }

      return {
        ...state,
        remoteParticipants: [
          ...state.remoteParticipants,
          action.remoteParticipant,
        ],
      };
    }
    case HmsStateActionTypes.ADD_UPDATE_PARTICIPANT: {
      if (
        state.remoteParticipants.findIndex(
          (remoteParticipant) =>
            remoteParticipant.peerID === action.remoteParticipant.peerID
        ) >= 0
      ) {
        return {
          ...state,
          remoteParticipants: state.remoteParticipants.map(
            (remoteParticipant) =>
              remoteParticipant.peerID === action.remoteParticipant.peerID ? action.remoteParticipant : remoteParticipant
          ),
        };
      }

      return {
        ...state,
        remoteParticipants: [
          ...state.remoteParticipants,
          action.remoteParticipant,
        ],
      };
    }
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
    case HmsStateActionTypes.ADD_TO_PREVIEW_PEERS_LIST:
      return {
        ...state,
        previewPeersList: [...state.previewPeersList, action.peer],
      };
    case HmsStateActionTypes.REMOVE_FROM_PREVIEW_PEERS_LIST:
      return {
        ...state,
        previewPeersList: state.previewPeersList.filter(
          (prevPeer) => prevPeer.peerID !== action.peerId
        ),
      };
    case HmsStateActionTypes.SET_LAYOUT_CONFIG:
      return {
        ...state,
        layoutConfig: action.layoutConfig,
      };
    case HmsStateActionTypes.SET_ROLE_CHANGE_REQUEST:
      return {
        ...state,
        roleChangeRequest: action.roleChangeRequest,
      };
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default hmsStatesReducer;
