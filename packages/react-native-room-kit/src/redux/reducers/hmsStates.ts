import type {
  HMSLocalPeer,
  HMSPeer,
  HMSRole,
  HMSRoleChangeRequest,
  HMSRoom,
  HMSSpeaker,
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
  | AddParticipant
  | RemoveParticipant
  | AddUpdateParticipant
  | SetActiveSpeakers
  | SetReconnecting;

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

type AddParticipant = {
  type: HmsStateActionTypes.ADD_PARTICIPANT;
  participant: HMSPeer;
};

type RemoveParticipant = {
  type: HmsStateActionTypes.REMOVE_PARTICIPANT;
  participant: HMSPeer;
};

type AddUpdateParticipant = {
  type: HmsStateActionTypes.ADD_UPDATE_PARTICIPANT;
  participant: HMSPeer;
};

type SetActiveSpeakers = {
  type: HmsStateActionTypes.SET_ACTIVE_SPEAKERS;
  activeSpeakers: HMSSpeaker[];
};

type SetReconnecting = {
  type: HmsStateActionTypes.SET_RECONNECTING;
  reconnecting: boolean;
};

type IntialStateType = {
  isLocalAudioMuted: boolean | undefined;
  isLocalVideoMuted: boolean | undefined;
  isLocalScreenShared: boolean | undefined;
  reconnecting: boolean;
  roomLocallyMuted: boolean;
  room: HMSRoom | null;
  localPeer: HMSLocalPeer | null;
  participants: (HMSPeer | HMSLocalPeer)[];
  activeSpeakers: HMSSpeaker[];
  roles: HMSRole[];
  previewPeersList: HMSPeer[];
  layoutConfig: Layout[] | null;
  roleChangeRequest: HMSRoleChangeRequest | null;
};

const INITIAL_STATE: IntialStateType = {
  isLocalAudioMuted: undefined,
  isLocalVideoMuted: undefined,
  isLocalScreenShared: undefined,
  reconnecting: false,
  roomLocallyMuted: false,
  room: null,
  localPeer: null,
  participants: [],
  activeSpeakers: [],
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
    case HmsStateActionTypes.SET_LOCAL_PEER_STATE: {
      const participantsHasLocalPeer =
        action.localPeer !== null
          ? state.participants.findIndex(
              (participant) => participant.peerID === action.localPeer?.peerID
            ) >= 0
          : false;

      return {
        ...state,
        localPeer: action.localPeer,
        isLocalAudioMuted: action.localPeer?.audioTrack?.isMute(),
        isLocalVideoMuted: action.localPeer?.videoTrack?.isMute(),

        // Adding or updating local peer in participants list
        participants:
          action.localPeer !== null
            ? participantsHasLocalPeer
              ? state.participants.map((participant) =>
                  participant.peerID === action.localPeer?.peerID
                    ? action.localPeer
                    : participant
                )
              : [action.localPeer, ...state.participants]
            : state.participants,
      };
    }
    case HmsStateActionTypes.ADD_PARTICIPANT: {
      if (
        state.participants.findIndex(
          (participant) => participant.peerID === action.participant.peerID
        ) >= 0
      ) {
        return state;
      }

      return {
        ...state,
        participants: [...state.participants, action.participant],
      };
    }
    case HmsStateActionTypes.REMOVE_PARTICIPANT: {
      if (
        state.participants.findIndex(
          (participant) => participant.peerID === action.participant.peerID
        ) >= 0
      ) {
        return {
          ...state,
          participants: state.participants.filter(
            (participant) => participant.peerID !== action.participant.peerID
          ),
        };
      }

      return state;
    }
    case HmsStateActionTypes.ADD_UPDATE_PARTICIPANT: {
      if (
        state.participants.findIndex(
          (participant) => participant.peerID === action.participant.peerID
        ) >= 0
      ) {
        return {
          ...state,
          participants: state.participants.map((participant) =>
            participant.peerID === action.participant.peerID
              ? action.participant
              : participant
          ),
        };
      }

      return {
        ...state,
        participants: [...state.participants, action.participant],
      };
    }
    case HmsStateActionTypes.SET_ROLES_STATE:
      return {
        ...state,
        roles: action.roles,
      };
    case HmsStateActionTypes.SET_ACTIVE_SPEAKERS:
      return {
        ...state,
        activeSpeakers: action.activeSpeakers,
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
    case HmsStateActionTypes.SET_RECONNECTING:
      return {
        ...state,
        reconnecting: action.reconnecting,
      };
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default hmsStatesReducer;
