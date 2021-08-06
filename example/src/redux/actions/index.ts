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
