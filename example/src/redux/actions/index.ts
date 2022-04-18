import type {HMSSDK} from '@100mslive/react-native-hms';
import actionTypes from '../actionTypes';

export const addMessage = (data: any) => ({
  type: actionTypes.ADD_MESSAGE.REQUEST,
  payload: data,
});

export const clearMessageData = () => ({
  type: actionTypes.CLEAR_MESSAGE_DATA.REQUEST,
});

export const setAudioVideoState = (data: {
  audioState: boolean;
  videoState: boolean;
}) => ({
  type: actionTypes.SET_AUDIO_VIDEO_STATE,
  payload: data,
});

export const saveUserData = (data: {
  userName?: String;
  roomID?: String;
  mirrorLocalVideo?: boolean;
}) => ({
  type: actionTypes.SAVE_USER_DATA.REQUEST,
  payload: data,
});

export const updateHmsReference = (data: {hmsInstance: HMSSDK}) => ({
  type: actionTypes.UPDATE_HMS_INSTANCE,
  payload: data,
});
