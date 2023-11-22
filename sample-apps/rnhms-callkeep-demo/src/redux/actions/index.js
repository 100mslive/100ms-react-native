import actionTypes from '../actionTypes';

export const saveUserData = (data) => ({
  type: actionTypes.SAVE_USER_DATA,
  payload: data,
});

export const clearHmsReference = () => ({
  type: actionTypes.CLEAR_HMS_INSTANCE,
});

export const resetJoinConfig = () => ({type: actionTypes.RESET_JOIN_CONFIG});

export const changeJoinAudioMuted = (value) => ({
  type: actionTypes.CHANGE_JOIN_AUDIO_MUTED,
  payload: {mutedAudio: value},
});

export const changeJoinVideoMuted = (value) => ({
  type: actionTypes.CHANGE_JOIN_VIDEO_MUTED,
  payload: {mutedVideo: value},
});

export const changeMirrorCamera = (value) => ({
  type: actionTypes.CHANGE_MIRROR_CAMERA,
  payload: {mirrorCamera: value},
});
