import type {
  HMSLocalPeer,
  HMSNoiseCancellationPlugin,
  HMSPeer,
  HMSRole,
  HMSRoleChangeRequest,
  HMSRoom,
  HMSSpeaker,
  HMSWhiteboard,
} from '@100mslive/react-native-hms';
import type { HMSVirtualBackgroundPlugin } from '../../modules/videoPluginWrapper';
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
  | AddParticipants
  | RemoveParticipant
  | RemoveParticipants
  | AddUpdateParticipant
  | ReplaceParticipantsList
  | SetActiveSpeakers
  | SetReconnecting
  | SetNoiseCancellationPlugin
  | SetVideoPlugin
  | SetWhiteboard;

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

type AddParticipants = {
  type: HmsStateActionTypes.ADD_PARTICIPANTS;
  participants: HMSPeer[];
};

type RemoveParticipant = {
  type: HmsStateActionTypes.REMOVE_PARTICIPANT;
  participant: HMSPeer;
};

type RemoveParticipants = {
  type: HmsStateActionTypes.REMOVE_PARTICIPANTS;
  participants: HMSPeer[];
};

type AddUpdateParticipant = {
  type: HmsStateActionTypes.UPDATE_PARTICIPANT;
  participant: HMSPeer;
};

type ReplaceParticipantsList = {
  type: HmsStateActionTypes.REPLACE_PARTICIPANTS_LIST;
  roleName: string;
  participants: HMSPeer[];
};

type SetActiveSpeakers = {
  type: HmsStateActionTypes.SET_ACTIVE_SPEAKERS;
  activeSpeakers: HMSSpeaker[];
};

type SetReconnecting = {
  type: HmsStateActionTypes.SET_RECONNECTING;
  reconnecting: boolean;
};

type SetNoiseCancellationPlugin = {
  type: HmsStateActionTypes.SET_NOISE_CANCELLATION_PLUGIN;
  noiseCancellationPlugin: HMSNoiseCancellationPlugin;
};

type SetVideoPlugin = {
  type: HmsStateActionTypes.SET_VIDEO_PLUGIN;
  videoPlugin: HMSVirtualBackgroundPlugin;
};

type SetWhiteboard = {
  type: HmsStateActionTypes.SET_WHITEBOARD;
  whiteboard: HMSWhiteboard | null;
};

type IntialStateType = {
  isLocalAudioMuted: boolean | undefined;
  isLocalVideoMuted: boolean | undefined;
  isLocalScreenShared: boolean | undefined;
  reconnecting: boolean;
  roomLocallyMuted: boolean;
  room: HMSRoom | null;
  localPeer: HMSLocalPeer | null;
  groupedParticipants: Record<string, (HMSPeer | HMSLocalPeer)[]>;
  activeSpeakers: HMSSpeaker[];
  roles: HMSRole[];
  previewPeersList: HMSPeer[];
  layoutConfig: Layout[] | null;
  roleChangeRequest: HMSRoleChangeRequest | null;
  noiseCancellationPlugin: HMSNoiseCancellationPlugin | null;
  videoPlugin: HMSVirtualBackgroundPlugin | null;
  whiteboard: HMSWhiteboard | null;
};

const INITIAL_STATE: IntialStateType = {
  isLocalAudioMuted: undefined,
  isLocalVideoMuted: undefined,
  isLocalScreenShared: undefined,
  reconnecting: false,
  roomLocallyMuted: false,
  room: null,
  localPeer: null,
  groupedParticipants: {},
  activeSpeakers: [],
  roles: [],
  previewPeersList: [],
  layoutConfig: null,
  roleChangeRequest: null,
  noiseCancellationPlugin: null,
  videoPlugin: null,
  whiteboard: null,
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
      let updatedGroupedParticipants = state.groupedParticipants;

      if (action.localPeer !== null) {
        let previousRoleName: HMSRole['name'] | null = null;
        let savedLocalPeer: HMSLocalPeer | HMSPeer | null = null;

        for (const groupName in state.groupedParticipants) {
          if (
            Object.prototype.hasOwnProperty.call(
              state.groupedParticipants,
              groupName
            )
          ) {
            const participantsList = state.groupedParticipants[groupName];

            if (Array.isArray(participantsList)) {
              const result = participantsList.find(
                (participant) => participant.peerID === action.localPeer?.peerID
              );

              if (result) {
                previousRoleName = groupName;
                savedLocalPeer = result;
                break;
              }
            }
          }
        }

        // update peer or check if  role change happened
        if (savedLocalPeer) {
          const currentRoleName = action.localPeer.role?.name!;

          const roleChanged =
            previousRoleName && previousRoleName !== currentRoleName;

          if (roleChanged && previousRoleName) {
            const previousList = state.groupedParticipants[previousRoleName];
            const currentList = state.groupedParticipants[currentRoleName];

            updatedGroupedParticipants = {
              ...state.groupedParticipants,
              // add to new list
              [currentRoleName]: Array.isArray(currentList)
                ? [action.localPeer, ...currentList]
                : [action.localPeer],
              // delete from old list
              [previousRoleName]: Array.isArray(previousList)
                ? previousList.filter(
                    (peer) => peer.peerID !== action.localPeer?.peerID
                  )
                : [],
            };
          } else {
            const participants = state.groupedParticipants[currentRoleName];

            updatedGroupedParticipants = {
              ...state.groupedParticipants,
              [currentRoleName]: Array.isArray(participants)
                ? participants.map((participant) =>
                    participant.peerID === action.localPeer?.peerID
                      ? action.localPeer
                      : participant
                  )
                : [action.localPeer],
            };
          }
        }
        // add peer
        else {
          const localPeerRoleName = action.localPeer.role?.name;

          if (localPeerRoleName) {
            const participants = state.groupedParticipants[localPeerRoleName];

            updatedGroupedParticipants = {
              ...state.groupedParticipants,
              [localPeerRoleName]: Array.isArray(participants)
                ? [action.localPeer, ...participants]
                : [action.localPeer],
            };
          }
        }
      }

      return {
        ...state,
        localPeer: action.localPeer,
        isLocalAudioMuted: action.localPeer?.audioTrack?.isMute(),
        isLocalVideoMuted: action.localPeer?.videoTrack?.isMute(),

        // Adding or updating local peer in participants list
        groupedParticipants: updatedGroupedParticipants,
      };
    }
    case HmsStateActionTypes.ADD_PARTICIPANT: {
      const participantRoleName = action.participant.role?.name;

      if (!participantRoleName) {
        return state;
      }

      const participants = state.groupedParticipants[participantRoleName];

      if (
        Array.isArray(participants) &&
        participants.findIndex(
          (participant) => participant.peerID === action.participant.peerID
        ) >= 0
      ) {
        return state;
      }

      return {
        ...state,
        groupedParticipants: {
          ...state.groupedParticipants,
          [participantRoleName]: Array.isArray(participants)
            ? [...participants, action.participant]
            : [action.participant],
        },
      };
    }
    case HmsStateActionTypes.ADD_PARTICIPANTS: {
      const participantsToAdd = new Map<string, (HMSPeer | HMSLocalPeer)[]>();

      const participants = Object.values(state.groupedParticipants).flat();

      action.participants.forEach((peerToAdd) => {
        // check if `peerToAdd` already exists
        const exists =
          participants.findIndex(
            (participant) => participant.peerID === peerToAdd.peerID
          ) >= 0;

        // if not exists, push to existing list or create new against the role
        if (!exists) {
          const list = participantsToAdd.get(peerToAdd.role?.name!);

          if (list) {
            list.push(peerToAdd);
          } else {
            participantsToAdd.set(peerToAdd.role?.name!, [peerToAdd]);
          }
        }
      });

      if (participantsToAdd.size === 0) {
        return state;
      }

      let updatedGroupedParticipants = { ...state.groupedParticipants };

      participantsToAdd.forEach((list, roleName) => {
        const oldList = updatedGroupedParticipants[roleName];
        updatedGroupedParticipants[roleName] = Array.isArray(oldList)
          ? [...oldList, ...list]
          : list;
      });

      return {
        ...state,
        groupedParticipants: updatedGroupedParticipants,
      };
    }
    case HmsStateActionTypes.REMOVE_PARTICIPANT: {
      const participantRoleName = action.participant.role?.name;

      if (!participantRoleName) {
        return state;
      }

      const participants = state.groupedParticipants[participantRoleName];

      if (
        Array.isArray(participants) &&
        participants.findIndex(
          (participant) => participant.peerID === action.participant.peerID
        ) >= 0
      ) {
        return {
          ...state,
          groupedParticipants: {
            ...state.groupedParticipants,
            [participantRoleName]: participants.filter(
              (participant) => participant.peerID !== action.participant.peerID
            ),
          },
        };
      }

      return state;
    }
    case HmsStateActionTypes.REMOVE_PARTICIPANTS: {
      const participantsToRemove = new Map<
        string,
        (HMSPeer | HMSLocalPeer)[]
      >();

      const participants = Object.values(state.groupedParticipants).flat();

      action.participants.forEach((peerToAdd) => {
        // check if `peerToAdd` already exists
        const exists =
          participants.findIndex(
            (participant) => participant.peerID === peerToAdd.peerID
          ) >= 0;

        // if exists, push to existing list or create new against the role
        if (exists) {
          const list = participantsToRemove.get(peerToAdd.role?.name!);

          if (list) {
            list.push(peerToAdd);
          } else {
            participantsToRemove.set(peerToAdd.role?.name!, [peerToAdd]);
          }
        }
      });

      if (participantsToRemove.size === 0) {
        return state;
      }

      let updatedGroupedParticipants = { ...state.groupedParticipants };

      participantsToRemove.forEach((list, roleName) => {
        const oldList = updatedGroupedParticipants[roleName];
        updatedGroupedParticipants[roleName] = Array.isArray(oldList)
          ? oldList.filter((participant) => {
              const notExists =
                list.findIndex(
                  (peerToRemove) => peerToRemove.peerID === participant.peerID
                ) < 0;

              // if `participant` is not in `removedPeers` list
              // then keep it, otherwise remove it
              return notExists;
            })
          : [];
      });

      return {
        ...state,
        groupedParticipants: updatedGroupedParticipants,
      };
    }
    case HmsStateActionTypes.UPDATE_PARTICIPANT: {
      let previousRoleName: HMSRole['name'] | null = null;

      for (const groupName in state.groupedParticipants) {
        if (
          Object.prototype.hasOwnProperty.call(
            state.groupedParticipants,
            groupName
          )
        ) {
          const participantsList = state.groupedParticipants[groupName];

          if (Array.isArray(participantsList)) {
            const result = participantsList.find(
              (participant) => participant.peerID === action.participant.peerID
            );

            if (result) {
              previousRoleName = groupName;
              break;
            }
          }
        }
      }

      if (!previousRoleName) {
        return state;
      }

      const currentRoleName = action.participant.role?.name!;

      // check if role change
      if (previousRoleName !== currentRoleName) {
        const previousRoleList = state.groupedParticipants[previousRoleName];
        const currentRoleList = state.groupedParticipants[currentRoleName];

        return {
          ...state,
          groupedParticipants: {
            ...state.groupedParticipants,
            // - add to new
            [currentRoleName]: Array.isArray(currentRoleList)
              ? [...currentRoleList, action.participant]
              : [action.participant],
            // - delete from old
            [previousRoleName]: Array.isArray(previousRoleList)
              ? previousRoleList.filter(
                  (p) => p.peerID !== action.participant.peerID
                )
              : [],
          },
        };
      }

      // update existing

      const currentList = state.groupedParticipants[currentRoleName];

      return {
        ...state,
        groupedParticipants: {
          ...state.groupedParticipants,
          [currentRoleName]: Array.isArray(currentList)
            ? currentList.map((p) =>
                p.peerID === action.participant.peerID ? action.participant : p
              )
            : [action.participant],
        },
      };
    }
    case HmsStateActionTypes.REPLACE_PARTICIPANTS_LIST: {
      return {
        ...state,
        groupedParticipants: {
          ...state.groupedParticipants,
          [action.roleName]: action.participants,
        },
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
    case HmsStateActionTypes.SET_NOISE_CANCELLATION_PLUGIN:
      return {
        ...state,
        noiseCancellationPlugin: action.noiseCancellationPlugin,
      };
    case HmsStateActionTypes.SET_VIDEO_PLUGIN:
      return {
        ...state,
        videoPlugin: action.videoPlugin,
      };
    case HmsStateActionTypes.SET_WHITEBOARD:
      return {
        ...state,
        whiteboard: action.whiteboard,
      };
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default hmsStatesReducer;
