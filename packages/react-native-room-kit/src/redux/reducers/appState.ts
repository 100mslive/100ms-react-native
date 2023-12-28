import ActionTypes, { HmsStateActionTypes } from '../actionTypes';
import { ChatBottomSheetTabs } from '../../utils/types';
import type { PeerTrackNode } from '../../utils/types';
import { SUPPORTED_ASPECT_RATIOS, ModalTypes } from '../../utils/types';
import { PipModes } from '../../utils/types';
import {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSPeer,
  HMSRemoteAudioStats,
  HMSRemoteVideoStats,
  HMSRole,
} from '@100mslive/react-native-hms';
import { MeetingState } from '../../types';
import type { Notification } from '../../types';

type ActionType = {
  payload: { [key: string]: any };
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
  hlsAspectRatio: { value: number; id: string };
  joinConfig: {
    mirrorCamera: boolean;
    autoSimulcast: boolean;
    showStats: boolean;
    showHLSStats: boolean;
    enableHLSPlayerControls: boolean;
    showCustomHLSPlayerControls: boolean;
  };
  modalType: ModalTypes;
  peerToUpdate: HMSPeer | null;
  meetingState: MeetingState;
  startingHLSStream: boolean;
  insetViewMinimized: boolean;
  miniviewPeerTrackNode: null | PeerTrackNode;
  localPeerTrackNode: null | PeerTrackNode;
  gridViewActivePage: number;
  startingOrStoppingRecording: boolean;
  fullScreenPeerTrackNode: null | PeerTrackNode;
  screensharePeerTrackNodes: PeerTrackNode[];
  notifications: Notification[];
  activeChatBottomSheetTab: (typeof ChatBottomSheetTabs)[number];
  chatFilterSheetVisible: boolean;
  handleBackButton: boolean;
  autoEnterPipMode: boolean;
  editUsernameDisabled: boolean;
  initialRole: HMSRole | null;
};

const INITIAL_STATE: IntialStateType = {
  peerState: [],
  pipModeStatus: PipModes.INACTIVE,
  rtcStats: {},
  hlsAspectRatio: SUPPORTED_ASPECT_RATIOS[0]!, // This is static array, and should always have 0th item
  joinConfig: {
    mirrorCamera: true,
    autoSimulcast: true,
    showStats: false,
    showHLSStats: false,
    enableHLSPlayerControls: false,
    showCustomHLSPlayerControls: false,
  },
  modalType: ModalTypes.DEFAULT,
  peerToUpdate: null,
  meetingState: MeetingState.NOT_JOINED,
  startingHLSStream: false,
  insetViewMinimized: false,
  miniviewPeerTrackNode: null,
  localPeerTrackNode: null,
  gridViewActivePage: 0,
  startingOrStoppingRecording: false,
  fullScreenPeerTrackNode: null,
  screensharePeerTrackNodes: [],
  notifications: [],
  activeChatBottomSheetTab: ChatBottomSheetTabs[0],
  chatFilterSheetVisible: false,
  handleBackButton: false,
  autoEnterPipMode: false,
  editUsernameDisabled: false,
  initialRole: null,
};

const appReducer = (
  state = INITIAL_STATE,
  action: ActionType
): IntialStateType => {
  switch (action.type) {
    case ActionTypes.CHANGE_PIP_MODE_STATUS:
      return { ...state, pipModeStatus: action.payload.pipModeStatus };
    case ActionTypes.SET_PEER_STATE:
      return { ...state, ...action.payload };
    case ActionTypes.CLEAR_PEER_DATA.REQUEST:
      return { ...state, peerState: [] };
    case ActionTypes.CHANGE_HLS_ASPECT_RATIO:
      return { ...state, hlsAspectRatio: action.payload.hlsAspectRatio };
    case ActionTypes.SET_MODAL_TYPE:
      return { ...state, modalType: action.payload.modalType };
    case ActionTypes.SET_PEER_TO_UPDATE:
      return { ...state, peerToUpdate: action.payload.peerToUpdate };
    case ActionTypes.RESET_JOIN_CONFIG:
      return { ...state, joinConfig: INITIAL_STATE.joinConfig };
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
    case ActionTypes.SET_MEETING_STATE:
      return { ...state, meetingState: action.payload.meetingState };
    case ActionTypes.SET_INSET_VIEW_MINIMIZED:
      return {
        ...state,
        insetViewMinimized: action.payload.insetViewMinimized,
      };
    case ActionTypes.SET_MINI_VIEW_PEERTRACKNODE:
      return {
        ...state,
        miniviewPeerTrackNode: action.payload.miniviewPeerTrackNode,
      };
    case ActionTypes.UPDATE_MINI_VIEW_PEERTRACKNODE: {
      if (!state.miniviewPeerTrackNode) {
        return state;
      }
      return {
        ...state,
        miniviewPeerTrackNode: {
          ...state.miniviewPeerTrackNode,
          ...action.payload,
        },
      };
    }
    case ActionTypes.SET_LOCAL_PEERTRACKNODE:
      return {
        ...state,
        localPeerTrackNode: action.payload.localPeerTrackNode,
      };
    case ActionTypes.UPDATE_LOCAL_PEERTRACKNODE: {
      if (!state.localPeerTrackNode) {
        return state;
      }
      return {
        ...state,
        localPeerTrackNode: {
          ...state.localPeerTrackNode,
          ...action.payload,
        },
      };
    }
    case ActionTypes.SET_FULLSCREEN_PEERTRACKNODE:
      return {
        ...state,
        fullScreenPeerTrackNode: action.payload.fullScreenPeerTrackNode,
      };
    case ActionTypes.UPDATE_FULLSCREEN_PEERTRACKNODE: {
      if (!state.fullScreenPeerTrackNode) {
        return state;
      }
      return {
        ...state,
        fullScreenPeerTrackNode: {
          ...state.fullScreenPeerTrackNode,
          ...action.payload,
        },
      };
    }
    case ActionTypes.SET_STARTING_HLS_STREAM:
      return { ...state, startingHLSStream: action.payload.startingHLSStream };
    case ActionTypes.SET_GRID_VIEW_ACTIVE_PAGE:
      return {
        ...state,
        gridViewActivePage: action.payload.gridViewActivePage,
      };
    case ActionTypes.SET_STARTING_OR_STOPPING_RECORDING:
      return {
        ...state,
        startingOrStoppingRecording: action.payload.startingOrStoppingRecording,
      };
    case ActionTypes.ADD_SCREENSHARE_TILE: {
      return {
        ...state,
        screensharePeerTrackNodes: [
          ...state.screensharePeerTrackNodes,
          action.payload.screenshareNode,
        ],
      };
    }
    case ActionTypes.REMOVE_SCREENSHARE_TILE: {
      return {
        ...state,
        screensharePeerTrackNodes: state.screensharePeerTrackNodes.filter(
          (node) => node.id !== action.payload.id
        ),
      };
    }
    case ActionTypes.UPDATE_SCREENSHARE_TILE: {
      return {
        ...state,
        screensharePeerTrackNodes: state.screensharePeerTrackNodes.map(
          (node) =>
            node.id === action.payload.id
              ? { ...node, ...action.payload }
              : node
        ),
      };
    }
    case ActionTypes.ADD_NOTIFICATION: {
      return {
        ...state,
        notifications: [action.payload.notification, ...state.notifications],
      };
    }
    case ActionTypes.REMOVE_NOTIFICATION: {
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload.id
        ),
      };
    }
    case ActionTypes.SET_ACTIVE_CHAT_BOTTOM_SHEET_TAB: {
      return {
        ...state,
        activeChatBottomSheetTab: action.payload.activeChatBottomSheetTab,
      };
    }
    case ActionTypes.SET_CHAT_FILTER_SHEET_VISIBLE: {
      return {
        ...state,
        chatFilterSheetVisible: action.payload.chatFilterSheetVisible,
      };
    }
    case ActionTypes.SET_HANDLE_BACK_BUTTON: {
      return {
        ...state,
        handleBackButton:
          action.payload.handleBackButton ?? INITIAL_STATE.handleBackButton,
      };
    }
    case ActionTypes.SET_AUTO_ENTER_PIP_MODE: {
      return {
        ...state,
        autoEnterPipMode:
          action.payload.autoEnterPipMode ?? INITIAL_STATE.autoEnterPipMode,
      };
    }
    case ActionTypes.SET_EDIT_USERNAME_DISABLED: {
      return {
        ...state,
        editUsernameDisabled:
          action.payload.editUsernameDisabled ??
          INITIAL_STATE.editUsernameDisabled,
      };
    }
    case ActionTypes.SET_INITIAL_ROLE: {
      return {
        ...state,
        initialRole: action.payload.initialRole ?? INITIAL_STATE.initialRole,
      };
    }
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default appReducer;
