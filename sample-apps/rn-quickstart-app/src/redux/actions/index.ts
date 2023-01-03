import type {HMSLocalPeer, HMSSDK} from '@100mslive/react-native-hms';

import actionTypes from '../actionTypes';

export const saveUserData = (data: {
  userName?: String;
  roomLink?: String;
  roomCode?: String;
  hmsInstance?: HMSSDK;
  hmsLocalPeer?: HMSLocalPeer;
}) => ({
  type: actionTypes.SAVE_USER_DATA,
  payload: data,
});

export const clearHmsReference = () => ({
  type: actionTypes.CLEAR_HMS_INSTANCE,
});

export const resetJoinConfig = () => ({type: actionTypes.RESET_JOIN_CONFIG});

export const changeJoinAudioMuted = (value: boolean) => ({
  type: actionTypes.CHANGE_JOIN_AUDIO_MUTED,
  payload: {mutedAudio: value},
});

export const changeJoinVideoMuted = (value: boolean) => ({
  type: actionTypes.CHANGE_JOIN_VIDEO_MUTED,
  payload: {mutedVideo: value},
});

export const changeMirrorCamera = (value: boolean) => ({
  type: actionTypes.CHANGE_MIRROR_CAMERA,
  payload: {mirrorCamera: value},
});
