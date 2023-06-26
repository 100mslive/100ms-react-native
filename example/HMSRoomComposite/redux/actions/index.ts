import {HMSRoom, HMSLocalPeer} from '@100mslive/react-native-hms';
import type {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSMessage,
  HMSRemoteAudioStats,
  HMSRemoteVideoStats,
  HMSRole,
  HMSSDK,
  HMSSessionStore,
} from '@100mslive/react-native-hms';
import type {PeerTrackNode, PipModes} from '../../utils/types';
import actionTypes, {HmsStateActionTypes} from '../actionTypes';

export const setPrebuiltData = (data: {
  roomCode: string;
  options?: {
    userName?: string;
    userId?: string;
    debugMode?: boolean;
    endPoints?: {
      init: string;
      token: string;
    };
  };
}) => ({
  type: HmsStateActionTypes.SET_PREBUILT_DATA,
  payload: data,
});

export const clearStore = () => ({
  type: HmsStateActionTypes.CLEAR_STATES,
});

export const setIsLocalVideoMutedState = (
  isLocalVideoMuted: boolean | undefined,
) => ({
  type: HmsStateActionTypes.SET_IS_LOCAL_VIDEO_MUTED_STATE,
  isLocalVideoMuted,
});

export const setIsLocalAudioMutedState = (
  isLocalAudioMuted: boolean | undefined,
) => ({
  type: HmsStateActionTypes.SET_IS_LOCAL_AUDIO_MUTED_STATE,
  isLocalAudioMuted,
});

export const setIsLocalScreenSharedState = (
  isLocalScreenShared: boolean | undefined,
) => ({
  type: HmsStateActionTypes.SET_IS_LOCAL_SCREEN_SHARED_STATE,
  isLocalScreenShared,
});

export const setHMSRoleState = (roles: HMSRole[]) => ({
  type: HmsStateActionTypes.SET_ROLES_STATE,
  roles,
});

export const setHMSRoomState = (room: HMSRoom | null) => ({
  type: HmsStateActionTypes.SET_ROOM_STATE,
  room,
});

export const setHMSLocalPeerState = (localPeer: HMSLocalPeer | null) => ({
  type: HmsStateActionTypes.SET_LOCAL_PEER_STATE,
  localPeer,
});

export const setHMSInstance = (hmsInstance: HMSSDK) => ({
  type: actionTypes.SET_HMS_INSTANCE,
  payload: {hmsInstance},
});

export const addMessage = (data: HMSMessage) => ({
  type: actionTypes.ADD_MESSAGE.REQUEST,
  payload: data,
});

export const addPinnedMessage = (data: string | null | undefined) => ({
  type: actionTypes.ADD_PINNED_MESSAGE.REQUEST,
  payload: data,
});

export const clearMessageData = () => ({
  type: actionTypes.CLEAR_MESSAGE_DATA.REQUEST,
});

export const setPeerState = (data: {peerState: PeerTrackNode[]}) => ({
  type: actionTypes.SET_PEER_STATE,
  payload: data,
});

export const changePipModeStatus = (pipModeStatus: PipModes) => ({
  type: actionTypes.CHANGE_PIP_MODE_STATUS,
  payload: {pipModeStatus},
});

export const clearPeerData = () => ({
  type: actionTypes.CLEAR_PEER_DATA.REQUEST,
});

export const saveUserData = (data: {
  userName?: String;
  roomID?: String;
  roomCode?: String;
  hmsInstance?: HMSSDK;
  hmsSessionStore?: HMSSessionStore;
  spotlightTrackId?: string | null;
  isHLSFlow?: boolean;
  roles?: HMSRole[];
}) => ({
  type: actionTypes.SAVE_USER_DATA.REQUEST,
  payload: data,
});

export const clearHmsReference = () => ({
  type: actionTypes.CLEAR_HMS_INSTANCE,
});

export const resetJoinConfig = () => ({type: actionTypes.RESET_JOIN_CONFIG});

export const changeMirrorCamera = (value: boolean) => ({
  type: actionTypes.CHANGE_MIRROR_CAMERA,
  payload: {mirrorCamera: value},
});

export const changeShowStats = (value: boolean) => ({
  type: actionTypes.CHANGE_SHOW_STATS,
  payload: {showStats: value},
});

export const changeShowHLSStats = (value: boolean) => ({
  type: actionTypes.CHANGE_SHOW_HLS_STATS,
  payload: {showHLSStats: value},
});

export const changeShowCustomHLSPlayerControls = (value: boolean) => ({
  type: actionTypes.CHANGE_SHOW_CUSTOM_HLS_PLAYER_CONTROLS,
  payload: {showCustomHLSPlayerControls: value},
});

export const changeEnableHLSPlayerControls = (value: boolean) => ({
  type: actionTypes.CHANGE_ENABLE_HLS_PLAYER_CONTROLS,
  payload: {enableHLSPlayerControls: value},
});

export const changeAutoSimulcast = (value: boolean) => ({
  type: actionTypes.CHANGE_AUTO_SIMULCAST,
  payload: {autoSimulcast: value},
});

export const setRTCStats = (
  trackId: string,
  stats:
    | HMSLocalAudioStats
    | HMSLocalVideoStats[]
    | HMSRemoteAudioStats
    | HMSRemoteVideoStats,
) => ({
  type: actionTypes.SET_RTC_STATS,
  payload: {trackId, stats},
});

export const changeHLSAspectRatio = (value: {value: number; id: string}) => ({
  type: actionTypes.CHANGE_HLS_ASPECT_RATIO,
  payload: {hlsAspectRatio: value},
});
